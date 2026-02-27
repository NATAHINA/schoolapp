'use client';
import { useState, useEffect } from 'react';
import { 
  Container, Title, Button, Table, Badge, Group, ActionIcon, 
  Modal, TextInput, Select, Stack, Paper, Loader, Text, PasswordInput 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUserPlus, IconTrash, IconEdit, IconShieldCheck } from '@tabler/icons-react';
import { Switch, Tooltip } from '@mantine/core';
import { IconUserCheck, IconUserOff } from '@tabler/icons-react';


export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'SECRETARY',
      phone: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email invalide'),
      password: (value) => {
        if (editingId && !value) return null;
        
        return value.length < 6 ? '6 caractères minimum' : null;
      },
    },
  });

  const fetchUsers = async () => {
    const schoolId = localStorage.getItem('school_id');
    try {
      const res = await fetch(`/api/schools/users?schoolId=${schoolId}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Impossible de charger les utilisateurs', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user: any) => {
    setEditingId(user._id);
    form.setValues({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      password: '',
    });
    setOpened(true);
  };

  const handleSubmit = async (values: any) => {
    const schoolId = localStorage.getItem('school_id');
    const isEditing = !!editingId;
    
    const url = isEditing ? `/api/schools/users/${editingId}` : '/api/schools/users';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, schoolId }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de l'opération");
      }

      notifications.show({ 
        title: 'Succès', 
        message: isEditing ? 'Compte mis à jour' : 'Compte créé avec succès', 
        color: 'teal' 
      });

      setOpened(false);
      setEditingId(null);
      form.reset();
      fetchUsers();
    } catch (err: any) {
      notifications.show({ title: 'Erreur', message: err.message, color: 'red' });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/schools/users/${userId}`, { method: 'PATCH' });
      if (!res.ok) throw new Error("Erreur lors du changement de statut");

      const result = await res.json();
      notifications.show({ 
        title: 'Statut mis à jour', 
        message: result.message, 
        color: result.isActive ? 'teal' : 'gray' 
      });
      
      fetchUsers(); // Recharger la liste
    } catch (err: any) {
      notifications.show({ title: 'Erreur', message: err.message, color: 'red' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'red';
      case 'ACCOUNTANT': return 'green';
      case 'SECRETARY': return 'blue';
      case 'SURVEILLANT': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper withBorder p="md" radius="md" mb="xl">
        <Group justify="space-between">
          <div>
            <Title order={2}>Personnel & Droits</Title>
            <Text fz="sm" c="dimmed">Gérez les comptes d'accès de votre établissement</Text>
          </div>
          <Button 
            leftSection={<IconUserPlus size={18} />} 
            onClick={() => {
              setEditingId(null);
              form.reset();
              setOpened(true);
            }} 
            color="teal"
          >
            Ajouter un membre
          </Button>
        </Group>
      </Paper>

      {loading ? <Loader variant="dots" /> : (
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nom</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Téléphone</Table.Th>
                <Table.Th>Rôle (Droit)</Table.Th>
                <Table.Th>Statut</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user: any) => (
                <Table.Tr key={user._id}>
                  <Table.Td fw={600}>{user.name}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.phone || '-'}</Table.Td>
                  <Table.Td>
                    <Badge color={getRoleColor(user.role)} variant="light">
                      {user.role}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge color={user.isActive ? 'teal' : 'red'} variant="dot">
                      {user.isActive ? 'Accès autorisé' : 'Accès bloqué'}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    {user.role !== 'ADMIN' && (
                    <Group gap={4}>
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(user)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      
                      <Tooltip label={user.isActive ? "Désactiver le compte" : "Activer le compte"}>
                        <ActionIcon 
                          variant="light" 
                          color={user.isActive ? 'orange' : 'teal'} 
                          onClick={() => handleToggleStatus(user._id)}
                        >
                          {user.isActive ? <IconUserOff size={16} /> : <IconUserCheck size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      {/* Modal de création */}
      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title={editingId ? "Modifier le compte Staff" : "Créer un compte Staff"} 
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="Nom complet" required {...form.getInputProps('name')} />
            <TextInput label="Email" required {...form.getInputProps('email')} />
            <TextInput label="Téléphone" {...form.getInputProps('phone')} />
            
            <PasswordInput 
              label={editingId ? "Changer le mot de passe (laisser vide pour garder l'actuel)" : "Mot de passe"} 
              required={!editingId}
              {...form.getInputProps('password')} 
            />
            
            <Select 
              label="Rôle / Droits d'accès"
              data={[
                { value: 'ACCOUNTANT', label: 'COMPTABLE (Finance)' },
                { value: 'SECRETARY', label: 'SECRÉTAIRE (Élèves/Notes)' },
                { value: 'SURVEILLANT', label: 'SURVEILLANT (Absences)' },
              ]}
              {...form.getInputProps('role')}
            />

            <Button type="submit" fullWidth color="teal" mt="md">
              {editingId ? "Enregistrer les modifications" : "Créer le compte"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}