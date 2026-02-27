'use client';

import { useState, useEffect } from 'react';
import { 
  Container, Title, Text, List, ThemeIcon, Divider, Stack, Paper, Box, Group, 
  Tooltip, ActionIcon, rem, useComputedColorScheme, useMantineColorScheme, 
  Badge, ScrollArea, NavLink, Anchor
} from '@mantine/core';
import { 
  IconScale, IconUserShield, IconBan, IconInfoCircle, IconShieldCheck, 
  IconArrowLeft, IconSun, IconMoon, IconLock, IconGavel 
} from '@tabler/icons-react';
import Link from 'next/link';

export default function TermsOfService() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = computedColorScheme === 'dark';

  return (
    <Box 
      style={{ 
        minHeight: '100vh',
        background: isDark 
          ? 'radial-gradient(circle at 0% 0%, #1A1B1E 0%, #101113 100%)' 
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        paddingBottom: rem(80)
      }}
    >
      {/* Header Flottant */}
      <Box 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          backdropFilter: 'blur(12px)',
          backgroundColor: isDark ? 'rgba(16, 17, 19, 0.85)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${isDark ? '#2C2E33' : '#E9ECEF'}`,
          padding: '12px 20px'
        }}
      >
        <Container size="lg">
          <Group justify="space-between">
            <Group>
              <ActionIcon 
                component={Link} 
                href="/" 
                variant="subtle" 
                color="gray" 
                radius="xl"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Divider orientation="vertical" />
              <Group gap="xs">
                <IconGavel size={20} color="var(--mantine-color-teal-6)" />
                <Text fw={700} fz="sm">EduManager Legal</Text>
              </Group>
            </Group>

            <ActionIcon 
              onClick={() => setColorScheme(isDark ? 'light' : 'dark')} 
              variant="default" 
              size="lg" 
              radius="md"
            >
              {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </Container>
      </Box>

      <Container size="lg" pt={50}>
        <Group align="flex-start" gap={50}>
        
          <Stack gap="xl" style={{ flex: 1 }}>
            <Box>
              <Badge variant="dot" color="blue" size="lg" mb="sm">Document Officiel</Badge>
              <Title order={1} style={{ fontSize: rem(42), lineHeight: 1.1 }} fw={900}>
                Conditions Générales <br /> 
                <Text component="span" variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} inherit>
                  d'Utilisation
                </Text>
              </Title>
              <Text c="dimmed" mt="md">
                Dernière révision : <strong>01 Mars 2026</strong> • Version 1.3.0
              </Text>
            </Box>

            <Paper 
              withBorder 
              p="xl" 
              radius="lg" 
              shadow="sm"
              style={{ 
                backgroundColor: isDark ? '#1A1B1E' : '#FFFFFF',
                borderColor: isDark ? '#2C2E33' : '#E9ECEF'
              }}
            >
              <Stack gap={40}>
                <Group align="flex-start" wrap="nowrap" mb="xl">
                  <ThemeIcon size={44} radius="md" variant="light" color="teal">
                    <IconInfoCircle size={26} />
                  </ThemeIcon>
                  <Text fz="lg" style={{ lineHeight: 1.6 }}>
                    EduManager est conçu pour simplifier la vie scolaire. En utilisant nos services, vous rejoignez une communauté basée sur la <strong>confiance</strong> et la <strong>transparence</strong>.
                  </Text>
                </Group>

                <Box>
                  <Group mb="md">
                    <ThemeIcon color="blue" variant="filled" radius="sm" size="sm">1</ThemeIcon>
                    <Title order={3} fw={800}>Accès et Inscription</Title>
                  </Group>
                  <Text c="gray.7" darkHidden mb="md">
                    La sécurité commence par un compte bien protégé. L'accès à EduManager est strictement réservé aux établissements partenaires et leurs membres.
                  </Text>
                  <Text c="gray.5" lightHidden mb="md">
                    La sécurité commence par un compte bien protégé. L'accès à EduManager est strictement réservé aux établissements partenaires et leurs membres.
                  </Text>
                </Box>

                <Divider />

                {/* Section 2 */}
                <Box>
                  <Group mb="md">
                    <ThemeIcon color="blue" variant="filled" radius="sm" size="sm">2</ThemeIcon>
                    <Title order={3} fw={800}>Propriété Intellectuelle</Title>
                  </Group>
                  <GridContent 
                    title="Notre Logiciel" 
                    desc="EduManager (code, design, algorithmes) reste notre propriété exclusive." 
                  />
                  <GridContent 
                    title="Vos Contenus" 
                    desc="Vos bulletins et factures vous appartiennent. Nous ne faisons que les héberger pour vous." 
                  />
                </Box>

                <Divider />

                {/* Section 3 */}
                <Box>
                  <Group mb="md">
                    <ThemeIcon color="red" variant="filled" radius="sm" size="sm">3</ThemeIcon>
                    <Title order={3} fw={800}>Comportements Prohibés</Title>
                  </Group>
                  <List 
                    spacing="md" 
                    size="md" 
                    center
                    icon={
                      <ThemeIcon color="red.1" c="red.6" size={24} radius="xl">
                        <IconBan size={14} stroke={3} />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>Tentative d'accès non autorisé aux serveurs</List.Item>
                    <List.Item>Harcèlement ou propos déplacés dans les messageries</List.Item>
                    <List.Item>Utilisation de scripts automatisés (bots) sans accord</List.Item>
                  </List>
                </Box>
              </Stack>
            </Paper>


            <Group justify="center" gap="xl" mt="xl">
              <Anchor href="/confidentialite" size="xs" c="dimmed">Lire les politiques de confidentialités</Anchor>
            </Group>
            
          </Stack>
        </Group>
      </Container>
    </Box>
  );
}


function GridContent({ title, desc }: { title: string, desc: string }) {
  return (
    <Box mb="md" pl="xl">
      <Text fw={700} fz="sm" mb={4}>{title}</Text>
      <Text fz="sm" c="dimmed">{desc}</Text>
    </Box>
  );
}
