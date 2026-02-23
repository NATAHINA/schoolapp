'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PasswordInput, Button, Paper, Box, rem, useComputedColorScheme,
Title, Container, Stack, Text, Tooltip, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const computedColorScheme = useComputedColorScheme('light');

  const handleSubmit = async () => {
    // Validations de base
    if (password.length < 6) {
      notifications.show({ title: 'Erreur', message: 'Le mot de passe doit faire 6 caractères minimum', color: 'red' });
      return;
    }

    if (password !== confirmPassword) {
      notifications.show({ title: 'Erreur', message: 'Les mots de passe ne correspondent pas', color: 'red' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: params.token,
          password 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        notifications.show({ 
          title: 'Succès', 
          message: 'Mot de passe réinitialisé ! Vous allez être redirigé...', 
          color: 'teal' 
        });
        setTimeout(() => router.push('/auth/login'), 2500);
      } else {
        notifications.show({ title: 'Erreur', message: data.error || 'Lien invalide ou expiré', color: 'red' });
      }
    } catch (e) {
      notifications.show({ title: 'Erreur', message: 'Une erreur est survenue', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

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
        <Title ta="center" fw={900}>Nouveau mot de passe</Title>
        <Text c="dimmed" fz="sm" ta="center" mt={5}>
          Veuillez choisir un mot de passe sécurisé.
        </Text>

        <Paper withBorder p={{ base: 'xl', sm: 45 }} mt={30} radius="md" style={{ backdropFilter: 'blur(10px)',boxShadow: 'var(--mantine-shadow-md)' }}>
          <Stack>
            <PasswordInput
              label="Nouveau mot de passe"
              placeholder="Minimum 6 caractères"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <PasswordInput
              label="Confirmer le mot de passe"
              placeholder="Répétez le mot de passe"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              error={password !== confirmPassword && confirmPassword.length > 0 ? "Les mots de passe diffèrent" : null}
            />
            <Button fullWidth onClick={handleSubmit} loading={loading} mt="md">
              Mettre à jour le mot de passe
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}