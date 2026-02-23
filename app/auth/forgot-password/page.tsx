'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Anchor,
  Box,
  Center, Stack,
  ActionIcon, Tooltip,
  useMantineColorScheme,
  useComputedColorScheme,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconArrowLeft, IconCheck, IconMailForward } from '@tabler/icons-react';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';

export default function ForgotPasswordPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  useEffect(() => setMounted(true), []);

  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Email invalide'),
    },
  });

  const handleReset = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");

      setSubmitted(true);
      notifications.show({
        title: 'Email envoyé',
        message: 'Veuillez vérifier votre boîte de réception',
        color: 'blue',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <Box style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '60px 20px 20px 20px',
        background: computedColorScheme === 'light' 
          ? 'linear-gradient(45deg, #EEF2FF 0%, #E0E7FF 100%)' 
          : '#101113' 
      }}>
      <Tooltip label="Retour à l'accueil">
        <ActionIcon 
          component={Link} 
          href="/" 
          variant="white"
          size="lg"
          radius="xl"
          style={{ 
            position: 'fixed',
            top: rem(20), 
            left: rem(20), 
            zIndex: 100,
            boxShadow: 'var(--mantine-shadow-md)'
          }}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
      </Tooltip>

      <Container size={550} w="100%" px="xs">
        <Paper withBorder p={{ base: 'xl', sm: 45 }} radius="lg" style={{ backdropFilter: 'blur(10px)',boxShadow: 'var(--mantine-shadow-lg)' }}>
          {!submitted ? (
            <>
              <Title order={2} ta="center" fw={900}>Mot de passe oublié ?</Title>
              <Text c="dimmed" fz="sm" ta="center" mt={5}>
                Entrez votre email pour recevoir un lien de réinitialisation
              </Text>

              <form onSubmit={form.onSubmit(handleReset)} style={{ marginTop: rem(25) }}>
                <TextInput 
                  label="Votre Email Professionnel" 
                  placeholder="admin@ecole.com" 
                  required 
                  leftSection={<IconAt size={16} />}
                  {...form.getInputProps('email')} 
                />
                
                <Group justify="space-between" mt="xl">
                  <Anchor component={Link} href="/auth/login" size="sm" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IconArrowLeft size={14} /> Retour à la connexion
                  </Anchor>
                  <Button type="submit" loading={loading} radius="md">Réinitialiser</Button>
                </Group>
              </form>
            </>
          ) : (
            <Center style={{ flexDirection: 'column' }}>
              <Box bg="blue.1" p="xl" style={{ borderRadius: '50%' }}>
                <IconMailForward size={40} color="var(--mantine-color-blue-6)" />
              </Box>
              <Title order={3} mt="md">Vérifiez vos emails</Title>
              <Text c="dimmed" ta="center" mt="sm">
                Un lien de récupération a été envoyé à <b>{form.values.email}</b>.
              </Text>

              <Stack gap="sm" mt="xl" style={{ width: '100%' }}>
                <Button variant="light" onClick={() => setSubmitted(false)}>
                  Réessayer avec un autre email
                </Button>
                
                <Button 
                  variant="subtle" 
                  color="gray"
                  component={Link} 
                  href="/auth/login"
                >
                  Retour à la connexion
                </Button>
              </Stack>
            </Center>
          )}
        </Paper>
      </Container>
    </Box>
  );
}