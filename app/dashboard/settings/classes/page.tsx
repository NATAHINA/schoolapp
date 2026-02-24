'use client';

import { useState, useEffect } from 'react';
import { 
  Title, LoadingOverlay, Box, Paper, Table, Group, Button, 
  TextInput, Modal, ActionIcon, Stack, Text, ScrollArea 
} from '@mantine/core';
import { 
  IconPlus, IconPencil, IconTrash, IconCheck, 
  IconAlertTriangle, IconSchool 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [className, setClassName] = useState('');

  const fetchClasses = async () => {
    const activeSchoolId = localStorage.getItem('school_id');
    if (!activeSchoolId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/classes?schoolId=${activeSchoolId}`);
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const openDeleteModal = (cls: any) =>
    modals.openConfirmModal({
      title: <Text fw={700}>Confirmer la suppression</Text>,
      centered: true,
      children: (
        <Stack gap="xs">
          <Text fz="sm">
            Êtes-vous sûr de vouloir supprimer la classe <b>{cls.name}</b> ?
          </Text>
          <Paper p="xs" withBorder bg="red.0" style={{ borderColor: 'var(--mantine-color-red-2)' }}>
            <Group gap={5} wrap="nowrap" align="flex-start">
              <IconAlertTriangle size={16} color="var(--mantine-color-red-7)" style={{ flexShrink: 0, marginTop: 2 }} />
              <Text fz="xs" fw={500} c="red.7">
                Cette action est irréversible. Les élèves n'auront plus de classe associée.
              </Text>
            </Group>
          </Paper>
        </Stack>
      ),
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      onConfirm: () => performDelete(cls._id),
    });

  const handleSave = async () => {
    if (!className.trim()) return;
    const activeSchoolId = localStorage.getItem('school_id');

    if (!activeSchoolId || activeSchoolId === "undefined") {
      notifications.show({ 
        title: 'Erreur', 
        message: "Session expirée. Reconnectez-vous.", 
        color: 'red' 
      });
      return;
    }

    setSaveLoading(true);
    const method = editingClass ? 'PUT' : 'POST';
    const url = editingClass 
      ? `/api/settings/classes/${editingClass._id}` 
      : '/api/settings/classes';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className, schoolId: activeSchoolId }),
      });

      if (res.ok) {
        notifications.show({ 
          title: 'Succès', 
          message: editingClass ? 'Classe mise à jour' : 'Classe créée', 
          color: 'teal',
          icon: <IconCheck size={16} />
        });
        close();
        setEditingClass(null);
        setClassName('');
        await fetchClasses();
      }
    } catch (error: any) {
      notifications.show({ title: 'Erreur', message: "Action impossible", color: 'red' });
    } finally {
      setSaveLoading(false);
    }
  };

  const performDelete = async (id: string) => {
    const res = await fetch(`/api/settings/classes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notifications.show({ title: 'Supprimé', message: 'Classe retirée', color: 'gray' });
      await fetchClasses(); 
    }
  };

  return (
    <Stack gap="lg">
     
      <Group justify="space-between" align="flex-end">
        <Stack gap={0}>
          <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>Paramétrage des Classes</Title>
          <Text fz="sm" c="dimmed" visibleFrom="sm">Gérez les divisions de votre établissement</Text>
        </Stack>
        <Button 
          leftSection={<IconPlus size={18} />} 
          onClick={() => { setEditingClass(null); setClassName(''); open(); }}
        >
          Ajouter une classe
        </Button>
      </Group>

      {/* TABLEAU RÉACTIF */}
      <Paper withBorder radius="md" p={0} pos="relative" style={{ overflow: 'hidden' }}>
        <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} zIndex={10} />
        
        <ScrollArea h={500} scrollbarSize={6}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Nom de la classe</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {classes.length === 0 && !loading ? (
                <Table.Tr>
                  <Table.Td colSpan={2} align="center" py="xl">
                    <Stack align="center" gap="xs">
                      <IconSchool size={40} color="gray" style={{ opacity: 0.5 }} />
                      <Text c="dimmed" size="sm">Aucune classe configurée</Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                classes.map((cls: any) => (
                  <Table.Tr key={cls._id}>
                    <Table.Td>
                      <Group gap="sm">
                        <IconSchool size={16} color="var(--mantine-color-blue-filled)" />
                        <Text fw={500} size="sm">{cls.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon 
                          variant="light" 
                          color="blue" 
                          onClick={() => { setEditingClass(cls); setClassName(cls.name); open(); }}
                        >
                          <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="light" 
                          color="red" 
                          onClick={() => openDeleteModal(cls)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* MODAL RÉACTIVE */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={<Text fw={700}>{editingClass ? "Modifier la classe" : "Nouvelle Classe"}</Text>} 
        centered
        size="sm"
        padding="lg"
      >
        <Stack gap="md">
          <TextInput 
            label="Nom de la classe" 
            placeholder="Ex: 6ème A, Terminale S, etc." 
            value={className} 
            onChange={(e) => setClassName(e.currentTarget.value)}
            required
            data-autofocus
          />
          <Button 
            onClick={handleSave} 
            loading={saveLoading} 
            fullWidth
            size="md"
          >
            {editingClass ? 'Mettre à jour' : 'Créer la classe'}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}

