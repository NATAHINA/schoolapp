

'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Table, Group, Text, Badge, ActionIcon, Title, Button, Paper, Box,
  TextInput, MultiSelect, Modal, Stack, Pagination, Center, ScrollArea 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { 
  IconPlus, IconDeviceMobileMessage, IconTrash, 
  IconPencil, IconSearch, IconSchool, IconUser  
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function TeachersPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activePage, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const ITEMS_PER_PAGE = 25;

  const form = useForm({
    initialValues: { name: '', email: '', phone: '', subjects: [], assignedClasses: [] },
    validate: {
      email: (value) => (!value || /^\S+@\S+$/.test(value) ? null : 'Email invalide'),
      phone: (value) => (value.length < 8 ? 'Téléphone invalide' : null),
    },
  });


  const fetchAllData = async () => {
  const activeSchoolId = localStorage.getItem('school_id');
  const query = activeSchoolId ? `?schoolId=${activeSchoolId}` : '';

  try {
    setLoading(true);
    const [resTeachers, resSubjects, resClasses] = await Promise.all([
      fetch(`/api/teachers${query}`),
      fetch(`/api/settings/subjects${query}`),
      fetch(`/api/settings/classes${query}`) 
    ]);

    // On vérifie si les réponses sont OK avant de transformer en JSON
    const dataTeachers = resTeachers.ok ? await resTeachers.json() : [];
    const dataSubjects = resSubjects.ok ? await resSubjects.json() : [];
    const dataClasses = resClasses.ok ? await resClasses.json() : [];

    setTeachers(Array.isArray(dataTeachers) ? dataTeachers : []);
    setSubjects(Array.isArray(dataSubjects) ? dataSubjects : []);
    setClasses(Array.isArray(dataClasses) ? dataClasses : []);
  } catch (error) {
    console.error("Erreur de chargement:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { 
    fetchAllData(); 
  }, []);

  // --- LOGIQUE DE RECHERCHE ET PAGINATION ---
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t: any) => 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
    );
  }, [teachers, search]);

  const paginatedTeachers = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredTeachers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTeachers, activePage]);

  // --- ACTIONS ---

  const handleEdit = (teacher: any) => {
    setEditingId(teacher._id);
    form.setValues({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone,
      subjects: teacher.subjects || [],
      assignedClasses: teacher.assignedClasses || [],
    });
    open();
  };

  const openDeleteModal = (id: string, name: string) =>
    modals.openConfirmModal({
      title: 'Supprimer le professeur',
      centered: true,
      children: (
        <Text size="sm">
          Êtes-vous sûr de vouloir supprimer <b>{name}</b> ? Cette action est irréversible.
        </Text>
      ),
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
          notifications.show({ title: 'Supprimé', message: 'Professeur retiré avec succès', color: 'gray' });
          fetchAllData();
        } catch (err) {
          notifications.show({ title: 'Erreur', message: 'Échec de la suppression', color: 'red' });
        }
      },
    });

  const handleSubmit = async (values: typeof form.values) => {
    const activeSchoolId = localStorage.getItem('school_id');

    if (!activeSchoolId) {
      notifications.show({ 
        title: 'Erreur', 
        message: 'ID de l’école manquant. Veuillez vous reconnecter.', 
        color: 'red' 
      });
      return;
    }

    const url = editingId ? `/api/teachers/${editingId}` : '/api/teachers';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, schoolId: activeSchoolId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      handleClose();
      fetchAllData();
      notifications.show({ 
        title: 'Succès', 
        message: editingId ? 'Profil mis à jour' : 'Professeur ajouté', 
        color: 'green' 
      });
    } catch (err: any) {
      notifications.show({ 
        title: 'Erreur', 
        message: err.message || 'Impossible d’enregistrer le professeur', 
        color: 'red' 
      });
    }

  };

  const handleClose = () => {
    form.reset();
    setEditingId(null);
    close();
  };

  return (
    <>
      <Group justify="space-between" mb="xl">
        <Stack gap={0}>
          <Title order={2} fw={900} fz={{ base: 'h3', sm: 'h2' }}>Gestion des Professeurs</Title>
          <Text fz="xs" c="dimmed">Total : {filteredTeachers.length} professeurs</Text>
        </Stack>
        <Button leftSection={<IconPlus size={18} />} onClick={open} radius="md">
          Ajouter un professeur
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md" shadow="sm">
        <TextInput
          placeholder="Rechercher par nom ou matière..."
          mb="md"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1); // Reset pagination on search
          }}
        />

        <ScrollArea h={600} onScrollPositionChange={({ y }) => {}} scrollbarSize={6}>
          <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: '100%', width: 'max-content' }}>
            <Table.Thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <Table.Tr>
                <Table.Th>Professeur</Table.Th>
                <Table.Th visibleFrom="sm">Matières</Table.Th>
                <Table.Th visibleFrom="md">Classes</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedTeachers.map((t: any) => (
                <Table.Tr key={t._id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Box visibleFrom="xs">
                         <ActionIcon variant="light" radius="xl" size="lg" color="blue"><IconUser size={18} /></ActionIcon>
                      </Box>
                      <Stack gap={2}>
                        <Text fw={600} fz="sm" lineClamp={1}>{t.name}</Text>
                        <Text fz="xs" c="dimmed">{t.phone || t.email}</Text>
                        <Group gap={4} hiddenFrom="sm" mt={4}>
                           {t.subjects?.slice(0, 2).map((s: string) => (
                             <Badge key={s} size="xs" variant="outline">{s}</Badge>
                           ))}
                           {t.subjects?.length > 2 && <Text size="xs">+{t.subjects.length - 2}</Text>}
                        </Group>
                      </Stack>
                    </Group>
                  </Table.Td>

                  <Table.Td visibleFrom="sm">
                    <Group gap={4}>
                      {t.subjects?.map((s: string) => (
                        <Badge key={s} size="xs" variant="dot" color="teal">{s}</Badge>
                      ))}
                    </Group>
                  </Table.Td>

                  <Table.Td visibleFrom="md">
                    <Text fz="xs" fw={500} c="dimmed">{t.assignedClasses?.join(', ') || 'Aucune'}</Text>
                  </Table.Td>

                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(t)}>
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => openDeleteModal(t._id, t.name)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredTeachers.length > ITEMS_PER_PAGE && (
          <Center mt="xl">
            <Pagination 
              total={Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE)} 
              value={activePage} 
              onChange={setPage} 
              radius="md" 
              size="sm"
            />
          </Center>
        )}
      </Paper>

      <Modal 
        opened={opened} 
        onClose={handleClose} 
        title={editingId ? "Modifier le Professeur" : "Nouveau Professeur"} 
        centered
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="Nom complet" placeholder="Ex: M. Jean" required {...form.getInputProps('name')} />
            <TextInput label="Email" placeholder="email@exemple.com" required {...form.getInputProps('email')} />
            <TextInput label="Téléphone" placeholder="+261..." required {...form.getInputProps('phone')} />
            <MultiSelect 
              label="Matières" 
              placeholder="Sélectionner les matières"
              data={subjects.map((s: any) => ({ value: s.name, label: s.name }))} 
              searchable
              nothingFoundMessage="Aucune matière trouvée"
              {...form.getInputProps('subjects')} 
            />
            <MultiSelect 
              label="Classes" 
              placeholder="Sélectionner les classes"
              data={classes.map((c: any) => ({ value: c.name, label: c.name }))} 
              searchable
              nothingFoundMessage="Aucune classe trouvée"
              {...form.getInputProps('assignedClasses')} 
            />
            <Button type="submit" fullWidth mt="md" radius="md">
              {editingId ? "Sauvegarder les changements" : "Enregistrer"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}