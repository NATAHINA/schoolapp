'use client';

import { 
  Title, Text, Paper, Stack, Group, ThemeIcon,Button,
  SimpleGrid, Badge, Divider, List, ThemeIcon as MantineIcon 
} from '@mantine/core';
import { 
  IconInfoCircle, IconVersions, IconUsersGroup, IconCash, 
  IconChartBar, IconSettings, IconShieldCheck, IconRocket,
  IconBrandFacebook 
} from '@tabler/icons-react';

export default function AboutPage() {
  const CURRENT_VERSION = "1.0-stable";
  const RELEASE_DATE = "Février 2026";

  const modules = [
    {
      title: 'Gestion Académique',
      icon: <IconUsersGroup size={20} />,
      color: 'blue',
      desc: 'Gestion complète des élèves, des parents et des professeurs avec assignations par classes.'
    },
    {
      title: 'Finance & Scolarité',
      icon: <IconCash size={20} />,
      color: 'teal',
      desc: 'Suivi des paiements, gestion de la grille tarifaire et historique des transactions.'
    },
    {
      title: 'Suivi de Présence',
      icon: <IconShieldCheck size={20} />,
      color: 'orange',
      desc: 'Système d\'appel numérique pour élèves et professeurs avec statistiques en temps réel.'
    },
    {
      title: 'Notes & Rapports',
      icon: <IconChartBar size={20} />,
      color: 'grape',
      desc: 'Saisie des notes, génération de bulletins et rapports de performance académique.'
    }
  ];

  return (
    <Stack gap="xl" py="md">
      {/* En-tête de version */}
      <Paper withBorder radius="md" p="xl" bg="var(--mantine-color-blue-light)">
        <Group justify="space-between">
          <Stack gap={0}>
            <Group gap="xs">
              <IconRocket color="var(--mantine-color-blue-filled)" />
              <Title order={2}>EduManager</Title>
            </Group>
            <Text c="dimmed" fz="sm">Solution intégrée de gestion scolaire pour établissements modernes.</Text>
          </Stack>
          <Stack align="flex-end" gap={5}>
            <Badge size="lg" variant="filled" color="blue">Version {CURRENT_VERSION}</Badge>
            <Text fz="xs" c="dimmed">Dernière mise à jour : {RELEASE_DATE}</Text>
          </Stack>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Section Fonctionnalités */}
        <Stack gap="md">
          <Title order={3}>Fonctionnalités Clés</Title>
          <SimpleGrid cols={1} spacing="xs">
            {modules.map((m, i) => (
              <Paper key={i} withBorder p="md" radius="md" shadow="xs">
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon color={m.color} variant="light" size="lg" radius="md">
                    {m.icon}
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={700} fz="sm">{m.title}</Text>
                    <Text fz="xs" c="dimmed">{m.desc}</Text>
                  </Stack>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>

        {/* Section Nouveautés / Technique */}
        <Stack gap="md">
          <Title order={3}>Informations Système</Title>
          <Paper withBorder radius="md" p="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fz="sm" fw={600}>Accès administrateur de l'école</Text>
                <Badge variant="dot" color="teal">Activé</Badge>
              </Group>
              <Divider variant="dashed" />
              <Group justify="space-between">
                <Text fz="sm" fw={600}>Accès Parent</Text>
                <Badge variant="dot" color="teal">Activé</Badge>
              </Group>
              <Divider variant="dashed" />
              <Group justify="space-between">
                <Text fz="sm" fw={600}>Module de Paiement</Text>
                <Badge variant="dot" color="blue">Sécurisé</Badge>
              </Group>
            </Stack>

            <Title order={5} mt="xl" mb="xs">Notes de version</Title>
            <List size="xs" spacing="xs" icon={<ThemeIcon size={12} radius="xl" color="teal"><IconShieldCheck size={10} /></ThemeIcon>}>
              <List.Item>Optimisation de la base de données (Multi-écoles).</List.Item>
              <List.Item>Nouveau module d'appel avec justificatifs.</List.Item>
              <List.Item>Gestion des années scolaires dynamiques.</List.Item>
              <List.Item>Amélioration de l'interface responsive.</List.Item>
            </List>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Stack gap="sm">
              <Group gap="sm" wrap="nowrap" align="flex-start">
                <IconInfoCircle size={20} color="gray" style={{ flexShrink: 0, marginTop: 2 }} />
                <Text fz="xs" c="dimmed" style={{ flex: 1 }}>
                  Cette application est la propriété de votre établissement. Toute reproduction est interdite. 
                  Pour tout support technique, veuillez utiliser la page Support.
                </Text>
              </Group>

              <Divider label="Retrouvez-nous sur" labelPosition="center" variant="dashed" />

              <Group justify="center" gap="xs">
                <Button 
                  component="a" 
                  href="https://www.facebook.com/profile.php?id=61561556410633"
                  target="_blank" 
                  variant="light" 
                  color="blue" 
                  size="xs" 
                  leftSection={<IconBrandFacebook size={16} />}
                >
                  Facebook
                </Button>
                
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}