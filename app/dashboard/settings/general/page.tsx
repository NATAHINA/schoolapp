'use client';

import { useState, useEffect } from 'react';
import { 
  TextInput, Button, Paper, Title, Text, Stack, SimpleGrid, 
  Group, LoadingOverlay, Divider, FileInput, Avatar, Box 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconSchool, IconWorld, IconDeviceFloppy, IconUpload } from '@tabler/icons-react';

export default function GeneralSettings() {
  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      _id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      nif: '',
      stat: '',
      rcs: '',
      website: '',
      logo: '',
    },
  });

  const loadSchoolData = async () => {
    const schoolId = localStorage.getItem('school_id');
    if (!schoolId) return;

    try {
      const res = await fetch(`/api/settings/general?schoolId=${schoolId}`);
      const data = await res.json();
      form.setValues(data);
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Impossible de charger les infos', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchoolData(); }, []);

  const handleLogoChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setFieldValue('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();

      const event = new CustomEvent('schoolUpdate', { detail: values });
      window.dispatchEvent(event);

      notifications.show({ title: 'Succès', message: 'Paramètres mis à jour', color: 'teal' });
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Échec de la sauvegarde', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      <Title order={3} fw={700}>Paramètres Généraux</Title>
      
      <Paper withBorder radius="md" p="xl" pos="relative">
        <LoadingOverlay visible={loading} />
        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={700} fz={{ base: 'h3', sm: 'h2' }}>Identité de l'établissement</Text>
              <Button leftSection={<IconDeviceFloppy size={18}/>} type="submit" color="teal">Enregistrer</Button>
            </Group>
            
            <Divider />

            <Group align="flex-end" mb="md">
              <Avatar 
                src={form.values.logo} 
                size={120} 
                radius="md" 
                variant="outline"
              >
                <IconSchool size={40} />
              </Avatar>
              <Stack gap={5}>
                <Text fz="sm" fw={500}>Logo de l'école</Text>
                <FileInput 
                  placeholder="Choisir une image" 
                  accept="image/png,image/jpeg"
                  leftSection={<IconUpload size={14} />}
                  onChange={handleLogoChange}
                  clearable
                />
                <Text fz="xs" c="dimmed">Format conseillé: Carré (PNG ou JPG)</Text>
              </Stack>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <TextInput label="Nom de l'école" required {...form.getInputProps('name')} />
              <TextInput label="Site Web" placeholder="https://..." leftSection={<IconWorld size={16}/>} {...form.getInputProps('website')} />
              <TextInput label="Email" {...form.getInputProps('email')} />
              <TextInput label="Téléphone" {...form.getInputProps('phone')} />
            </SimpleGrid>

            <TextInput label="Adresse" {...form.getInputProps('address')} />

            <Text fw={700} mt="lg">Informations Légales & Fiscales</Text>
            <Divider />

            <SimpleGrid cols={{ base: 1, md: 3 }}>
              <TextInput label="NIF" placeholder="Numéro d'Identité Fiscale" {...form.getInputProps('nif')} />
              <TextInput label="STAT" placeholder="Numéro Statistique" {...form.getInputProps('stat')} />
              <TextInput label="RCS" placeholder="Registre du Commerce" {...form.getInputProps('rcs')} />
            </SimpleGrid>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}