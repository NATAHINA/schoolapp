'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Table, Group, Text, ActionIcon, Badge, Paper, Title, 
  Button, TextInput, Modal, MultiSelect, Stack, LoadingOverlay, 
  ScrollArea, Pagination, Center 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { 
  IconUserPlus, IconSearch, IconMail, IconPhone, 
  IconTrash, IconPencil, IconCheck 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

export default function ParentsManagementPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<{ value: string; label: string }[]>([]);
  const [classes, setClasses] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [activePage, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const form = useForm({
    initialValues: { name: '', email: '', phone: '', children: [] },
    validate: {
      email: (value) => {
        if (!value) return null;
        return /^\S+@\S+$/.test(value) ? null : 'Email invalide';
      },
      phone: (value) => (value.length < 8 ? 'Téléphone invalide' : null),
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const activeSchoolId = localStorage.getItem('school_id'); // Vérifiez bien si c'est school_id ou schoolId

      if (!activeSchoolId) {
        console.error("Pas de schoolId trouvé");
        return;
      }

      // 2. Envoyer le schoolId dans l'URL
      const [resParents, resStudents, resClasses] = await Promise.all([
        fetch(`/api/parents?schoolId=${activeSchoolId}&t=${Date.now()}`), 
        fetch(`/api/students?schoolId=${activeSchoolId}`), // Filtrez aussi les étudiants par école
        fetch(`/api/settings/classes?schoolId=${activeSchoolId}`)
      ]);
      
      const parentsData = await resParents.json();
      const studentsData = await resStudents.json();
      const classesData = await resClasses.json();
      
      setClasses(Array.isArray(classesData) ? classesData : []);
      setParents(Array.isArray(parentsData) ? parentsData : []);

      const studentOptions = (Array.isArray(studentsData) ? studentsData : []).map((s: any) => {
        const sClassId = s.class?._id || s.class;
        
        const classObj = classesData.find((c: any) => String(c._id) === String(sClassId));
        
        return { 
          value: String(s._id), 
          label: `${s.name} (${classObj?.name || 'Classe non trouvée'})` 
        };
      });

      setStudents(studentOptions);
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Échec du chargement', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);


  const getChildDisplay = (child: any) => {
    if (!child) return 'Inconnu';

    if (typeof child === 'object' && child.name) {
      if (child.class?.name) return `${child.name} (${child.class.name})`;
      
      const cId = child.class?._id || child.class;
      const classObj = classes.find(c => String(c._id) === String(cId));
      return `${child.name} (${classObj?.name || 'N/A'})`;
    }

    const studentId = String(child);
    const found = students.find(s => String(s.value) === studentId);
    return found ? found.label : 'Chargement...';
  };

  const filteredParents = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!Array.isArray(parents)) return [];

    return parents.filter((p: any) => 
      p.name?.toLowerCase().includes(query) ||
      p.phone?.includes(query) ||
      p.children?.some((c: any) => c.name?.toLowerCase().includes(query))
    );
  }, [parents, search]);

  const paginatedParents = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredParents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredParents, activePage]);


  // --- ACTIONS ---
  const handleSubmit = async (values: typeof form.values) => {
    const activeSchoolId = localStorage.getItem('school_id'); 

    if (!activeSchoolId) {
      notifications.show({ 
        title: 'Erreur', 
        message: 'ID Établissement introuvable. Reconnectez-vous.', 
        color: 'red' 
      });
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `/api/parents/${editingId}` : '/api/parents';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          schoolId: activeSchoolId // Envoyé dans le body
        }),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      notifications.show({ title: 'Succès', message: 'Parent et compte créés', color: 'teal' });
      handleClose();
      loadData();
    } catch (error: any) {
      notifications.show({ title: 'Erreur', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (parent: any) => {
    setEditingId(parent._id);
    form.setValues({
      name: parent.name,
      email: parent.email || '',
      phone: parent.phone,
      children: parent.children?.map((c: any) => c._id) || [],
    });
    open();
  };

  const openDeleteConfirm = (parentId: string, parentName: string) =>
    modals.openConfirmModal({
      title: 'Confirmer la suppression',
      centered: true,
      children: <Text fz="sm">Voulez-vous vraiment supprimer le compte de <b>{parentName}</b> ?</Text>,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await fetch(`/api/parents/${parentId}`, { method: 'DELETE' });
        loadData();
        notifications.show({ title: 'Supprimé', message: 'Compte parent retiré', color: 'blue' });
      },
    });

  const handleClose = () => {
    form.reset();
    setEditingId(null);
    close();
  };

  return (
    <>
      <Group justify="space-between" mb="xl">
        <Stack gap={0}>
          <Title order={2} fw={800}>Espace Parents</Title>
          <Text fz="xs" c="dimmed">{filteredParents.length} parents enregistrés</Text>
        </Stack>
        <Button leftSection={<IconUserPlus size={18} />} onClick={() => { setEditingId(null); form.reset(); open(); }} radius="md">
          Ajouter un Parent
        </Button>
      </Group>

      <Paper withBorder radius="md" p="md" shadow="sm" pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        
        <TextInput 
          placeholder="Rechercher un parent ou un enfant..." 
          mb="md" 
          leftSection={<IconSearch size={16} />} 
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
        />

        <ScrollArea>
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Parent</Table.Th>
                <Table.Th>Enfant(s) & Classe(s)</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedParents.length > 0 ? (
                paginatedParents.map((parent: any) => (
                  <Table.Tr key={parent._id}>
                    <Table.Td><Text fw={600} size="sm">{parent.name}</Text></Table.Td>
                    <Table.Td>
                      <Group gap={5}>
                        {parent.children?.map((child: any) => (
                          <Badge key={child._id} size="sm" variant="light" color="cyan">
                            {getChildDisplay(child)}
                          </Badge>
                        ))}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        {parent.email && (
                          <Group gap={5}><IconMail size={14} color="gray"/> <Text size="xs">{parent.email}</Text></Group>
                        )}
                        <Group gap={5}><IconPhone size={14} color="gray"/> <Text size="xs">{parent.phone}</Text></Group>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(parent)}>
                          <IconPencil size={18}/>
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => openDeleteConfirm(parent._id, parent.name)}>
                          <IconTrash size={18}/>
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr><Table.Td colSpan={4}><Text ta="center" py="xl" c="dimmed">Aucun parent trouvé</Text></Table.Td></Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredParents.length > ITEMS_PER_PAGE && (
          <Center mt="xl">
            <Pagination total={Math.ceil(filteredParents.length / ITEMS_PER_PAGE)} value={activePage} onChange={setPage} color="teal" />
          </Center>
        )}
      </Paper>

      <Modal opened={opened} onClose={handleClose} title={editingId ? "Modifier le Parent" : "Créer un compte Parent"} centered size="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="Nom complet" placeholder="M. Jean Martin" required {...form.getInputProps('name')} />
            <TextInput label="Email" placeholder="parent@mail.com" {...form.getInputProps('email')} />
            <TextInput label="Téléphone" placeholder="+261..." required {...form.getInputProps('phone')} />
            
            <MultiSelect 
              label="Lier aux élèves" 
              placeholder="Sélectionner les enfants" 
              data={students}
              searchable 
              clearable
              required 
              {...form.getInputProps('children')} 
            />
            
            <Button type="submit" fullWidth mt="md" loading={loading}>
              {editingId ? "Sauvegarder les modifications" : "Enregistrer le compte"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}