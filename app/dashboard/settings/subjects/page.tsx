'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Title, LoadingOverlay, Paper, Table, Group, Button, 
  TextInput, Modal, ActionIcon, Stack, Text, NumberInput, 
  Pagination, Select, Box, SimpleGrid, ScrollArea 
} from '@mantine/core';
import { 
  IconPlus, IconPencil, IconTrash, IconCheck, 
  IconSearch, IconBook, IconAlertTriangle  
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';

export default function SubjectsPage() {
  // ... (vos états restent identiques) ...
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', coeff: 1, category: 'Scientifique' });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [activePage, setPage] = useState(1);
  const itemsPerPage = 15;

  const fetchSubjects = async () => {
    const activeSchoolId = localStorage.getItem('school_id');
    if (!activeSchoolId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/settings/subjects?schoolId=${activeSchoolId}`);
      const data = await res.json();
      setSubjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s: any) => {
      const matchesSearch = s.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = categoryFilter ? s.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [subjects, debouncedSearch, categoryFilter]);

  useEffect(() => { setPage(1); }, [debouncedSearch, categoryFilter]);

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginatedSubjects = filteredSubjects.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const handleSave = async () => {
    if (!formData.name) return;
    const schoolId = localStorage.getItem('school_id');
    setSaveLoading(true);
    try {
      const method = editingSubject ? 'PUT' : 'POST';
      const url = editingSubject ? `/api/settings/subjects/${editingSubject._id}` : '/api/settings/subjects';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, schoolId }),
      });
      if (res.ok) {
        notifications.show({ title: 'Succès', message: 'Matière enregistrée', color: 'teal', icon: <IconCheck size={16} /> });
        close();
        fetchSubjects();
      }
    } finally { setSaveLoading(false); }
  };

  const openDeleteModal = (subject: any) =>
    modals.openConfirmModal({
      title: 'Supprimer la matière',
      centered: true,
      children: (
        <Stack gap="xs">
          <Text size="sm">Voulez-vous vraiment supprimer <b>{subject.name}</b> ? Cela pourrait affecter les notes liées.</Text>
          <Box p="xs" style={{ color: 'var(--mantine-color-red-7)' }} >
            <Group gap={5} wrap="nowrap" align="flex-start">
              <IconAlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <Text fz="sm" fw={500}>Cette action est irréversible.</Text>
            </Group>
          </Box>
        </Stack>
      ),
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await fetch(`/api/settings/subjects/${subject._id}`, { method: 'DELETE' });
        fetchSubjects();
      },
    });

  return (
    <Stack gap="md">
      {/* En-tête : Colonne sur mobile, Ligne sur Desktop */}
      <Group justify="space-between" align="center">
        <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>Gestion des Matières</Title>
        <Button 
          leftSection={<IconPlus size={18} />} 
          onClick={() => {
            setEditingSubject(null);
            setFormData({ name: '', coeff: 1, category: 'Scientifique' });
            open();
          }}
        >
          Nouvelle Matière
        </Button>
      </Group>

      <Paper withBorder p={{ base: 'sm', sm: 'md' }} radius="md">
        {/* Filtres : Stack sur mobile, Group grow sur desktop */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
          <TextInput
            placeholder="Rechercher par nom..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Select
            placeholder="Filtrer par catégorie"
            clearable
            data={['Scientifique', 'Littéraire', 'Artistique', 'Sportive', 'Autre']}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </SimpleGrid>

        <Box pos="relative">
          <LoadingOverlay visible={loading} zIndex={10} overlayProps={{ radius: "sm", blur: 2 }} />
          
          {/* Stats : 2 colonnes sur mobile, flexibles sur desktop */}
          <SimpleGrid cols={{ base: 2, sm: 2 }} mb="md">
            <Paper withBorder p="xs" radius="md" ta="center">
              <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>Total Matières</Text>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={700}>{subjects.length}</Text>
            </Paper>
            <Paper withBorder p="xs" radius="md" ta="center">
              <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>Coeff Total</Text>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={700} c="blue">
                {subjects.reduce((acc: number, curr: any) => acc + (curr.coeff || 0), 0)}
              </Text>
            </Paper>
          </SimpleGrid>

          {/* Tableau avec défilement horizontal sur mobile */}
          <ScrollArea h={500} onScrollPositionChange={({ y }) => {}} scrollbarSize={6}>
            <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 600 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nom de la matière</Table.Th>
                  <Table.Th>Coefficient</Table.Th>
                  <Table.Th>Catégorie</Table.Th>
                  <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedSubjects.map((subject: any) => (
                  <Table.Tr key={subject._id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <IconBook size={16} color="gray" />
                        <Text fw={500} truncate>{subject.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td><Text fw={700}>{subject.coeff}</Text></Table.Td>
                    <Table.Td>{subject.category}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="light" onClick={() => {
                          setEditingSubject(subject);
                          setFormData({ name: subject.name, coeff: subject.coeff, category: subject.category });
                          open();
                        }}>
                          <IconPencil size={18} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" onClick={() => openDeleteModal(subject)}>
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination 
                total={totalPages} 
                value={activePage} 
                onChange={setPage} 
                size="sm"
              />
            </Group>
          )}
        </Box>
      </Paper>

      <Modal 
        opened={opened} 
        onClose={close} 
        title={editingSubject ? "Modifier Matière" : "Ajouter Matière"} 
        centered
        size="md"
        padding="md"
      >
        <Stack>
          <TextInput
            label="Nom de la matière"
            placeholder="Ex: Mathématiques"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <NumberInput
            label="Coefficient"
            min={1}
            value={formData.coeff}
            onChange={(val) => setFormData({ ...formData, coeff: Number(val) })}
          />
          <Select
            label="Catégorie"
            data={['Scientifique', 'Littéraire', 'Artistique', 'Sportive', 'Autre']}
            value={formData.category}
            onChange={(val) => setFormData({ ...formData, category: val || 'Autre' })}
          />
          <Button fullWidth onClick={handleSave} loading={saveLoading} mt="md">
            Enregistrer
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}

