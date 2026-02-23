'use client';
import { useState, useEffect } from 'react';
import { 
  Container, Title, Tabs, TextInput, Button, Group, SimpleGrid,
  Stack, Paper, Avatar, Text, Divider, PasswordInput, ActionIcon, Tooltip
} from '@mantine/core';
import { 
  IconUser, IconLock, IconDeviceFloppy, IconShieldCheck, 
  IconPhone, IconMail, IconEdit, IconInfoCircle 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function SettingsPage() {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('user_id');
      try {
        const res = await fetch(`/api/users/profile?userId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.profile?.phone || ''
          });
        }
      } catch (error) {
        notifications.show({ title: 'Erreur', message: 'Impossible de charger le profil', color: 'red' });
      }
    };
    fetchProfile();
  }, []);

  // --- FONCTION 1 : MISE À JOUR DES INFOS ---
  const updateGeneralInfo = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      return notifications.show({ title: 'Erreur', message: 'Le nom et le téléphone sont requis', color: 'red' });
    }

    setLoadingProfile(true);
    const userId = localStorage.getItem('user_id');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId, type: 'GENERAL' }),
      });

      if (res.ok) {
        notifications.show({ title: 'Succès', message: 'Informations mises à jour', color: 'teal', icon: <IconDeviceFloppy size={18}/> });
      } else {
        const err = await res.json();
        notifications.show({ title: 'Erreur', message: err.error, color: 'red' });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- FONCTION 2 : MISE À JOUR DU MOT DE PASSE ---
  const updatePassword = async () => {
    if (!securityData.currentPassword || !securityData.newPassword) {
      return notifications.show({ title: 'Erreur', message: 'Veuillez remplir tous les champs de mot de passe', color: 'red' });
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      return notifications.show({ title: 'Erreur', message: 'Les mots de passe ne correspondent pas', color: 'red' });
    }
    if (securityData.newPassword.length < 8) {
      return notifications.show({ title: 'Erreur', message: 'Le mot de passe doit faire 8 caractères minimum', color: 'red' });
    }

    setLoadingPassword(true);
    const userId = localStorage.getItem('user_id');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...securityData, userId, type: 'PASSWORD' }),
      });

      if (res.ok) {
        notifications.show({ title: 'Sécurité mise à jour', message: 'Votre mot de passe a été modifié', color: 'blue', icon: <IconShieldCheck size={18}/> });
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const err = await res.json();
        notifications.show({ title: 'Erreur', message: err.error, color: 'red' });
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={1} fw={900} style={{ letterSpacing: -1 }}>Mon Profil</Title>
            <Text c="dimmed">Gérez vos informations personnelles et votre sécurité</Text>
          </div>
          <Avatar size="xl" radius="xl" color="teal" variant="filled">
            {formData.name.substring(0, 2).toUpperCase()}
          </Avatar>
        </Group>

        <Tabs defaultValue="account" variant="pills" color="teal" radius="md">
          <Tabs.List mb="lg">
            <Tabs.Tab value="account" leftSection={<IconUser size={18} />}>Informations</Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconLock size={18} />}>Sécurité</Tabs.Tab>
          </Tabs.List>

          {/* PANEL INFORMATIONS */}
          <Tabs.Panel value="account">
            <Paper withBorder p="xl" radius="lg" shadow="xs">
              <Stack gap="lg">
                <Group>
                  <IconEdit size={20} color="var(--mantine-color-teal-filled)" />
                  <Text fw={700} fz="lg">Informations générales</Text>
                </Group>
                
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                  <TextInput 
                    label="Nom Complet"
                    placeholder="Votre nom"
                    leftSection={<IconUser size={16} />}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <TextInput 
                    label="Email"
                    disabled
                    leftSection={<IconMail size={16} />}
                    value={formData.email}
                    rightSection={
                      <Tooltip label="L'email ne peut pas être modifié">
                        <IconInfoCircle size={16} color="gray" />
                      </Tooltip>
                    }
                  />
                  <TextInput 
                    label="Téléphone"
                    placeholder="Votre numéro"
                    leftSection={<IconPhone size={16} />}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </SimpleGrid>

                <Button 
                  onClick={updateGeneralInfo} 
                  loading={loadingProfile} 
                  variant="filled" 
                  color="teal" 
                  size="md"
                  radius="md"
                >
                  Mettre à jour mes informations
                </Button>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* PANEL SÉCURITÉ */}
          <Tabs.Panel value="security">
            <Paper withBorder p="xl" radius="lg" shadow="xs">
              <Stack gap="lg">
                <Group>
                  <IconShieldCheck size={20} color="var(--mantine-color-orange-filled)" />
                  <Text fw={700} fz="lg">Protection du compte</Text>
                </Group>

                <PasswordInput 
                  label="Mot de passe actuel"
                  description="Requis pour toute modification de sécurité"
                  placeholder="Votre mot de passe actuel"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                />

                <Divider my="sm" variant="dashed" />

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                  <PasswordInput 
                    label="Nouveau mot de passe"
                    placeholder="Minimum 8 caractères"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                  />
                  <PasswordInput 
                    label="Confirmation"
                    placeholder="Répétez le mot de passe"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    error={securityData.newPassword !== securityData.confirmPassword && securityData.confirmPassword !== ''}
                  />
                </SimpleGrid>

                <Button 
                  onClick={updatePassword} 
                  loading={loadingPassword} 
                  color="orange" 
                  size="md"
                  radius="md"
                >
                  Changer mon mot de passe
                </Button>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}