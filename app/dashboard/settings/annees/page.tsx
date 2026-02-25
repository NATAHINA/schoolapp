'use client';

import { useState, useEffect } from 'react';
import { 
  Title, Box, LoadingOverlay, Paper, Table, Group, ScrollArea,
  Button, TextInput, Modal, ActionIcon, Stack, Text, Badge, Switch, SimpleGrid
} from '@mantine/core';
import { 
  IconPlus, IconPencil, IconCheck, IconCalendar, IconCalendarCheck 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

export default function AnneesPage() {
  const [annees, setAnnees] = useState<any[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingAnnee, setEditingAnnee] = useState<any>(null);
  const [anneeName, setAnneeName] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  const fetchAnnees = async () => {
    const schoolId = localStorage.getItem('school_id');
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/annee?schoolId=${schoolId}`);
      const data = await res.json();
      setAnnees(Array.isArray(data) ? data : []);
    } catch (error) {
      setAnnees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnees(); }, []);

  const handleSave = async () => {
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(anneeName)) {
      notifications.show({ 
        title: 'Format invalide', 
        message: 'Utilisez le format YYYY-YYYY (ex: 2025-2026)', 
        color: 'orange' 
      });
      return;
    }

    const activeSchoolId = localStorage.getItem('school_id');
    setSaveLoading(true);

    try {
      const method = editingAnnee ? 'PUT' : 'POST';
      const url = editingAnnee 
        ? `/api/settings/annee/${editingAnnee._id}`
        : '/api/settings/annee';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: anneeName, 
          isCurrent: isCurrent,
          schoolId: activeSchoolId 
        }),
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      notifications.show({ title: 'Succès', message: 'Année sauvegardée', color: 'teal', icon: <IconCheck size={16} /> });

      if (isCurrent) {
        localStorage.setItem('active_annee_id', editingAnnee?._id || result._id);
        window.dispatchEvent(new Event('storage'));
      }

      close();
      fetchAnnees();
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Échec de l\'opération', color: 'red' });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      {/* HEADER RÉACTIF */}

      <Group justify="space-between" align="flex-end">
        <Stack gap={0}>
          <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>Cycles Scolaires</Title>
          <Text fz="sm" c="dimmed" visibleFrom="sm">Configurez les périodes d'activité de votre établissement</Text>
        </Stack>
        <Button 
          leftSection={<IconPlus size={18} />} 
          onClick={() => { 
            setEditingAnnee(null); setAnneeName(''); setIsCurrent(false); open(); 
          }}
        >
          Ajouter une classe
        </Button>
      </Group>

      {/* LISTE DES ANNÉES */}
      <Paper withBorder radius="md" p={0} pos="relative" style={{ overflow: 'hidden' }}>
        <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} zIndex={10} />
        
        <ScrollArea h={500} scrollbarSize={6}>
          <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover style={{ minWidth: 450 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Année scolaire</Table.Th>
                <Table.Th>Statut</Table.Th>
                <Table.Th style={{ width: 80 }}>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {annees.map((item: any) => (
                <Table.Tr key={item._id}>
                  <Table.Td>
                    <Group gap="sm">
                      <IconCalendar size={18} color="gray" />
                      <Text fw={700} size="sm">{item.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {item.isCurrent ? (
                      <Badge color="teal" variant="light" leftSection={<IconCheck size={10} />}>
                        Année Actuelle
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="dot">Archive</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon 
                      variant="subtle" 
                      color="blue"
                      size="lg"
                      onClick={() => {
                        setEditingAnnee(item); setAnneeName(item.name);
                        setIsCurrent(item.isCurrent); open();
                      }}
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* MODAL CONFIGURATION */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={<Text fw={700}>Configuration de l'année</Text>} 
        centered
        padding="xl"
      >
        <Stack gap="lg">
          <TextInput 
            label="Libellé de l'année" 
            placeholder="Ex: 2025-2026" 
            description="Le format doit être YYYY-YYYY"
            value={anneeName} 
            onChange={(e) => setAnneeName(e.currentTarget.value)}
            required
            size="md"
          />
          
          <Paper p="md" withBorder radius="md" bg={isCurrent ? 'teal.0' : 'gray.0'}>
            <Switch
              label="Définir comme période active"
              checked={isCurrent}
              onChange={(event) => setIsCurrent(event.currentTarget.checked)}
              description="Toutes les notes et absences seront liées à cette année par défaut."
              color="teal"
            />
          </Paper>

          <Button 
            onClick={handleSave} 
            loading={saveLoading} 
            fullWidth 
            size="md"
            color="teal"
          >
            Enregistrer les modifications
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}


