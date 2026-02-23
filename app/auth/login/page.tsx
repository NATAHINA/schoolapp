

'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Anchor,
  Stack,
  Box,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  useComputedColorScheme, rem
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSun, IconMoon, IconLock, IconAt, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (redirectPath && router) {
      router.push(redirectPath);
    }
  }, [redirectPath, router]);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Email invalide'),
      password: (val) => (val.length < 1 ? 'Mot de passe requis' : null),
    },
  });

  // --- LA VRAIE ACTION DE CONNEXION ---
  const handleLogin = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      localStorage.setItem('school_id', data.schoolId);
      localStorage.setItem('user_name', data.name || '');
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_id', data.userId);

      notifications.show({
        title: 'Connexion réussie',
        message: `Bienvenue ${data.name}`,
        color: 'teal',
      });

      let path = '/dashboard';
      if (data.role === 'PARENT') path = '/dashboard/parent';
      else if (data.role === 'TEACHER') path = '/dashboard/teachers';
      else if (data.role === 'STUDENT') path = '/dashboard/students';
      
      setRedirectPath(path);
      
    } catch (error: any) {
      notifications.show({
        title: 'Échec de connexion',
        message: error.message,
        color: 'red',
      });
    } finally {
      if (!redirectPath) setLoading(false);
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
        <Paper withBorder p={{ base: 'xl', sm: 45 }} radius="lg" style={{ backdropFilter: 'blur(10px)',boxShadow: 'var(--mantine-shadow-xl)' }}>
          <Group justify="space-between" mb="lg">
            <Title order={2} fw={900}>Connexion</Title>
            <ActionIcon onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')} variant="light" size="lg">
              {computedColorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
            </ActionIcon>
          </Group>

          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack>
              <TextInput 
                label="Email Professionnel" 
                placeholder="nom@gmail.com" 
                required 
                leftSection={<IconAt size={16} />}
                disabled={loading}
                {...form.getInputProps('email')} 
              />
              
              <Box>
                <PasswordInput 
                  label="Mot de passe" 
                  placeholder="••••••••" 
                  required 
                  leftSection={<IconLock size={16} />}
                  disabled={loading}
                  {...form.getInputProps('password')} 
                />
                <Group justify="flex-end" mt={5}>
                  <Anchor component={Link} href="/auth/forgot-password" size="xs" c="dimmed">
                    Mot de passe oublié ?
                  </Anchor>
                </Group>
              </Box>
            </Stack>

            <Button type="submit" fullWidth radius="md" mt="xl" size="md" loading={loading}>
              Se connecter
            </Button>

            <Text ta="center" mt="md" size="sm" c="dimmed">
              Nouveau ici ?{' '}
              <Anchor component={Link} href="/auth/register" fw={700}>
                Créer un compte école
              </Anchor>
            </Text>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}