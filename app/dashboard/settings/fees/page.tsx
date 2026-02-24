'use client';

import { useState, useEffect } from 'react';
import { 
  Title, Paper, Table, NumberInput, TextInput, Select, 
  Button, Group, Stack, ActionIcon, SimpleGrid, Text, Badge, Box, ScrollArea 
} from '@mantine/core';
import { IconTrash, IconPlus, IconSettings, IconEdit, IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

export default function FeeConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    id: null,
    name: '',
    amount: 0,
    feeType: 'Écolage',
    category: 'Mensuel',
    classId: ''
  });

  const FEE_TYPES = ['Inscription', 'Écolage', 'Examen', 'Droit', 'Matériel', 'Autre'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const schoolId = localStorage.getItem('school_id');
    const academicYear = localStorage.getItem('active_annee_id');

    if (!schoolId || schoolId === 'null' || !academicYear || academicYear === 'null') return; 
    
    try {
      const resConfigs = await fetch(`/api/settings/fee-config?schoolId=${schoolId}&academicYear=${academicYear}`);
      const dataConfigs = await resConfigs.json();
      if (Array.isArray(dataConfigs)) setConfigs(dataConfigs);

      const resClasses = await fetch(`/api/settings/classes?schoolId=${schoolId}`);
      if (resClasses.ok) {
        const dataClasses = await resClasses.json();
        setClasses(dataClasses.map((c: any) => ({ value: c._id, label: c.name })));
      }
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || form.amount <= 0 || !form.classId) {
      notifications.show({ message: 'Veuillez remplir tous les champs', color: 'orange' });
      return;
    }
    setLoading(true);
    const schoolId = localStorage.getItem('school_id');
    const academicYear = localStorage.getItem('active_annee_id');
    const url = form.id ? `/api/settings/fee-config/${form.id}` : `/api/settings/fee-config`;
    const method = form.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, schoolId, academicYear })
      });
      if (res.ok) {
        notifications.show({ title: 'Succès', message: 'Tarif enregistré', color: 'teal' });
        setForm({ id: null, name: '', amount: 0, feeType: 'Écolage', category: 'Mensuel', classId: '' });
        fetchInitialData();
      }
    } finally { setLoading(false); }
  };

  const deleteConfig = (id: string) => {
    modals.openConfirmModal({
      title: 'Confirmation de suppression',
      centered: true,
      children: (
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <IconAlertTriangle color="red" size={24} style={{ flexShrink: 0 }} />
          <Text fz="sm">
            Voulez-vous vraiment supprimer ce tarif ? Cette action est irréversible.
          </Text>
        </Group>
      ),
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const res = await fetch(`/api/settings/fee-config/${id}`, { method: 'DELETE' });
        if (res.ok) { fetchInitialData(); }
      },
    });
  };

  return (
    <Stack gap="lg">
      <Group gap="sm">
        <IconSettings size={30} className="screen-only" />
        <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>Paramétrage des Frais</Title>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 1, lg: 2 }} spacing="lg">
        {/* Formulaire */}
        <Paper withBorder p={{ base: 'sm', sm: 'md' }} radius="md" shadow="sm">
          <Title order={4} mb="md" c="blue">{form.id ? 'Modifier le Tarif' : 'Nouveau Tarif'}</Title>
          <Stack gap="sm">
            <Select 
              label="Classe concernée" 
              placeholder="Choisir une classe" 
              data={classes} 
              value={form.classId}
              onChange={(val) => setForm({...form, classId: val || ''})}
              searchable
              required
            />
            <TextInput 
              label="Nom du frais" 
              placeholder="Ex: Écolage Mensuel" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
            
            {/* Responsivité ici : 2 colonnes sur desktop, empilé sur mobile */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <Select 
                label="Type" 
                data={FEE_TYPES} 
                value={form.feeType}
                onChange={(val) => setForm({...form, feeType: val || ''})}
              />
              <Select 
                label="Fréquence" 
                data={['Mensuel', 'Unique']} 
                value={form.category}
                onChange={(val) => setForm({...form, category: val || ''})}
              />
            </SimpleGrid>

            <NumberInput 
              label="Montant (Ar)" 
              thousandSeparator=" "
              value={form.amount}
              onChange={(val) => setForm({...form, amount: Number(val)})}
              required
            />
            <Button 
              leftSection={form.id ? <IconEdit size={18}/> : <IconPlus size={18}/>} 
              onClick={handleSubmit} 
              loading={loading}
              color={form.id ? "orange" : "blue"}
              fullWidth
            >
              {form.id ? "Mettre à jour" : "Ajouter le tarif"}
            </Button>
            {form.id && (
              <Button variant="subtle" color="gray" size="sm" onClick={() => setForm({id: null, name: '', amount: 0, feeType: 'Écolage', category: 'Mensuel', classId: ''})}>
                Annuler
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Liste des tarifs avec ScrollArea */}
        <Paper withBorder p={{ base: 'sm', sm: 'md' }} radius="md">
          <Title order={4} mb="md">Liste des Tarifs</Title>
          
          <ScrollArea w="100%">
            <Table striped highlightOnHover verticalSpacing="xs" style={{ minWidth: 500 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Classe / Motif</Table.Th>
                  <Table.Th ta="right">Montant</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {configs.map((c: any) => (
                  <Table.Tr key={c._id}>
                    <Table.Td>
                      <Box mb={4}>
                        <Badge variant="light" color="cyan" size="xs">
                          {c.classId?.name || 'Classe inconnue'}
                        </Badge>
                      </Box>
                      <Text fw={600} size="sm" truncate>{c.name}</Text>
                      <Text size="xs" c="dimmed">{c.feeType} • {c.category}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                       <Text fw={700} size="sm">{c.amount.toLocaleString()} Ar</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap={8} justify="flex-end" wrap="nowrap">
                        <ActionIcon 
                          variant="light" 
                          color="orange" 
                          size="sm"
                          onClick={() => setForm({
                            id: c._id, 
                            name: c.name, 
                            amount: c.amount, 
                            feeType: c.feeType, 
                            category: c.category, 
                            classId: c.classId?._id || c.classId
                          })}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" onClick={() => deleteConfig(c._id)}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {configs.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={3} ta="center" c="dimmed" py="xl">Aucun tarif configuré</Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}


