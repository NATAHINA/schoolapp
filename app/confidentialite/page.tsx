
'use client';

import { useState, useEffect } from 'react';
import { 
  Container, Title, Text, Stack, Paper, Box, Group, Tooltip, ActionIcon, 
  rem, useComputedColorScheme, useMantineColorScheme, Badge, Table, 
  ThemeIcon, Divider, Anchor, List
} from '@mantine/core';
import { 
  IconShieldLock, IconArrowLeft, IconSun, IconMoon, IconEye, 
  IconDatabase, IconUserCheck, IconBrandFacebook, IconCookie, IconLifebuoy 
} from '@tabler/icons-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = computedColorScheme === 'dark';

  const dataRows = [
    { type: 'Identité', data: 'Nom, Prénom, Email', finality: 'Authentification', icon: <IconUserCheck size={16} /> },
    { type: 'Scolarité', data: 'Notes, Absences, Classe', finality: 'Suivi pédagogique', icon: <IconDatabase size={16} /> },
    { type: 'Technique', data: 'IP, Cookies, Logs', finality: 'Sécurité & Debug', icon: <IconCookie size={16} /> },
  ];

  return (
    <Box 
      style={{ 
        minHeight: '100vh',
        background: isDark 
          ? 'radial-gradient(circle at 100% 0%, #1A1B1E 0%, #101113 100%)' 
          : 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)',
        paddingBottom: rem(80)
      }}
    >
      {/* Header Flottant */}
      <Box 
        style={{ 
          position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)',
          backgroundColor: isDark ? 'rgba(16, 17, 19, 0.85)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${isDark ? '#2C2E33' : '#E9ECEF'}`,
          padding: '12px 20px'
        }}
      >
        <Container size="lg">
          <Group justify="space-between">
            <Group>
              <ActionIcon component={Link} href="/" variant="subtle" color="gray" radius="xl">
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Divider orientation="vertical" />
              <Group gap="xs">
                <IconShieldLock size={20} color="var(--mantine-color-teal-6)" />
                <Text fw={700} size="sm">EduManager Privacy</Text>
              </Group>
            </Group>
            <ActionIcon onClick={() => setColorScheme(isDark ? 'light' : 'dark')} variant="default" size="lg" radius="md">
              {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </Container>
      </Box>

      <Container size="md" pt={50}>
        <Stack gap="xl">
          {/* Hero Section */}
          <Box ta="center" mb="xl">
            <Badge variant="filled" color="teal" size="lg" mb="sm" radius="sm">Conformité RGPD</Badge>
            <Title order={1} style={{ fontSize: rem(48), lineHeight: 1.1 }} fw={900}>
              Votre vie privée est <br />
              <Text component="span" variant="gradient" gradient={{ from: 'teal', to: 'lime' }} inherit>
                notre priorité.
              </Text>
            </Title>
            <Text c="dimmed" mt="md" size="lg" maw={600} mx="auto">
              Chez EduManager, nous traitons vos données avec la même rigueur que vos diplômes. Voici comment nous les protégeons.
            </Text>
          </Box>

          <Paper withBorder p="xl" radius="lg" shadow="md" bg={isDark ? '#1A1B1E' : '#FFFFFF'}>
            <Stack gap={40}>
              
              {/* Section 1: Transparence */}
              <section>
                <Group mb="lg">
                  <ThemeIcon variant="light" color="teal" size="xl" radius="md">
                    <IconEye size={24} />
                  </ThemeIcon>
                  <Title order={3}>Quelles données collectons-nous ?</Title>
                </Group>
                
                <Table verticalSpacing="md" withTableBorder={false}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Catégorie</Table.Th>
                      <Table.Th>Données</Table.Th>
                      <Table.Th>Usage</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {dataRows.map((row) => (
                      <Table.Tr key={row.type}>
                        <Table.Td>
                          <Group gap="xs">
                            <ThemeIcon size="xs" variant="transparent" color="teal">{row.icon}</ThemeIcon>
                            <Text fw={600} size="sm">{row.type}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{row.data}</Text></Table.Td>
                        <Table.Td><Badge variant="outline" color="gray" size="sm">{row.finality}</Badge></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </section>

              <Divider />

              <section>
                <Title order={3} mb="md">Vos 4 droits fondamentaux</Title>
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   {[
                     { t: 'Droit d\'accès', d: 'Consultez vos données à tout moment.' },
                     { t: 'Droit à l\'oubli', d: 'Supprimez votre compte et vos traces.' },
                     { t: 'Rectification', d: 'Corrigez vos informations erronées.' },
                     { t: 'Portabilité', d: 'Récupérez vos données sous format PDF ou Excel. ' }
                   ].map((item, i) => (
                     <Paper key={i} withBorder p="sm" radius="md" bg={isDark ? 'rgba(255,255,255,0.02)' : 'gray.0'}>
                       <Text fw={700} size="xs" tt="uppercase" c="teal">0{i+1}. {item.t}</Text>
                       <Text size="xs" c="dimmed">{item.d}</Text>
                     </Paper>
                   ))}
                </Box>
              </section>

              <Divider />

              <Paper bg="teal.9" p="xl" radius="md" c="white">
                <Group justify="space-between">
                  <Box maw={400}>
                    <Title order={4} mb="xs">Une question sur vos données ?</Title>
                    <Text size="sm" opacity={0.8}>Pour toute demande relative à l'exercice de vos droits informatique et libertés, notre délégué à la protection des données est à votre entière disposition.</Text>
                  </Box>
                  <ActionIcon 
                    variant="white" 
                    color="teal" 
                    size={50} 
                    radius="xl"
                    component="a"
                    href="https://www.facebook.com/profile.php?id=61561556410633"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconBrandFacebook size={24} />
                  </ActionIcon>
                </Group>
              </Paper>

            </Stack>
          </Paper>

          <Group justify="center" gap="xl" mt="xl">
            <Anchor href="/cgu" size="xs" c="dimmed">Lire les CGU</Anchor>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}