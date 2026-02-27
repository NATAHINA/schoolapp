'use client';

import { 
  Title, Text, Paper, Stack, Group, ThemeIcon, Button,
  SimpleGrid, Badge, Divider, List, ScrollArea
} from '@mantine/core';
import { 
  IconInfoCircle, IconUsersGroup, IconCash, 
  IconChartBar, IconShieldCheck, IconRocket,
  IconBrandFacebook, IconUserShield, IconLock, IconHistory
} from '@tabler/icons-react';

export default function AboutPage() {
  const CURRENT_VERSION = "1.3-stable";
  const RELEASE_DATE = "Mars 2026";

  const modules = [
    {
      title: 'Gestion Académique',
      icon: <IconUsersGroup size={20} />,
      color: 'blue',
      desc: 'Gestion complète des élèves, des parents et des professeurs avec assignations par classes.'
    },
    {
      title: 'Personnel & Droits',
      icon: <IconUserShield size={20} />,
      color: 'orange',
      desc: 'Contrôle granulaire des accès staff avec système d\'activation/désactivation de compte.'
    },
    {
      title: 'Finance & Scolarité',
      icon: <IconCash size={20} />,
      color: 'teal',
      desc: 'Suivi des revenus, gestion des écolages et accès restreint aux données sensibles.'
    },
    {
      title: 'Analytique & Notes',
      icon: <IconChartBar size={20} />,
      color: 'grape',
      desc: 'Dashboard interactif, saisie des notes et statistiques de performance en temps réel.'
    }
  ];

  return (
    <Stack gap="xl" py="md">
      {/* --- EN-TÊTE DE VERSION --- */}
      <Paper withBorder radius="md" p="xl" bg="var(--mantine-color-teal-light)">
        <Group justify="space-between">
          <Stack gap={2}>
            <Group gap="xs">
              <ThemeIcon size="lg" color="teal" variant="filled" radius="md">
                <IconRocket size={20} />
              </ThemeIcon>
              <Title order={2}>EduManager</Title>
            </Group>
            <Text c="dimmed" fz="sm">Plateforme tout-en-un pour la gestion administrative et pédagogique.</Text>
          </Stack>
          <Stack align="flex-end" gap={5}>
            <Badge size="xl" variant="filled" color="teal" radius="sm">Version {CURRENT_VERSION}</Badge>
            <Text fz="xs" c="dimmed">Déployée le : {RELEASE_DATE}</Text>
          </Stack>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* --- COLONNE GAUCHE : MODULES --- */}
        <Stack gap="md">
          <Title order={3}>Modules du Système</Title>
          <SimpleGrid cols={1} spacing="sm">
            {modules.map((m, i) => (
              <Paper key={i} withBorder p="md" radius="md" shadow="xs">
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon color={m.color} variant="light" size="xl" radius="md">
                    {m.icon}
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={700} fz="md">{m.title}</Text>
                    <Text fz="sm" c="dimmed">{m.desc}</Text>
                  </Stack>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>

          <Paper withBorder radius="md" p="md" mt="sm">
            <Group gap="sm" mb="xs">
              <IconLock size={18} color="orange" />
              <Text fw={600} fz="sm">Confidentialité & Sécurité</Text>
            </Group>
            <Text fz="xs" c="dimmed" lh={1.6}>
              EduManager utilise un chiffrement de bout en bout pour les mots de passe 
               et une isolation stricte des données par établissement. 
            </Text>
          </Paper>
        </Stack>

        {/* --- COLONNE DROITE : HISTORIQUE --- */}
        <Stack gap="md">
          <Group gap="xs">
            <IconHistory size={22} />
            <Title order={3}>Journal des modifications</Title>
          </Group>
          
          <Paper withBorder radius="md" p="md">
            <ScrollArea.Autosize mah={500} type="hover">
              <Stack gap="xl">
                
                {/* VERSION 1.3 */}
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Badge color="teal" variant="filled">v1.3 (Actuelle)</Badge>
                    <Text fz="xs" c="dimmed" fw={500}>Mars 2026</Text>
                  </Group>
                  <List size="xs" spacing={6} icon={<ThemeIcon size={14} radius="xl" color="teal"><IconShieldCheck size={10} /></ThemeIcon>}>
                    <List.Item fw={600}>Gestion avancée du Staff : activation/désactivation de compte.</List.Item>
                    <List.Item fw={600}>Protection des revenus : masquage des graphiques financiers selon le rôle.</List.Item>
                    <List.Item>Correction du bug de validation sur la modification des utilisateurs.</List.Item>
                    <List.Item>Optimisation de la page de gestion du personnel (Tableau responsive).</List.Item>
                  </List>
                </Stack>

                <Divider variant="dashed" />

                {/* VERSION 1.2 */}
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Badge color="blue" variant="light">v1.2</Badge>
                    <Text fz="xs" c="dimmed" fw={500}>Février 2026</Text>
                  </Group>
                  <List size="xs" spacing={6} icon={<ThemeIcon size={14} radius="xl" color="blue"><IconShieldCheck size={10} /></ThemeIcon>}>
                    <List.Item>Nouveau Dashboard visuel avec statistiques en temps réel.</List.Item>
                    <List.Item>Filtres de période par date pour l'analyse des inscriptions et revenus.</List.Item>
                    <List.Item>Intégration de DayJS pour une gestion des dates en français.</List.Item>
                    <List.Item>Module d'absences avec compteurs journaliers.</List.Item>
                  </List>
                </Stack>

                <Divider variant="dashed" />

                {/* VERSION 1.1 */}
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Badge color="gray" variant="outline">v1.0</Badge>
                    <Text fz="xs" c="dimmed" fw={500}>Janvier 2026</Text>
                  </Group>
                  <List size="xs" spacing={6} icon={<ThemeIcon size={14} radius="xl" color="gray"><IconShieldCheck size={10} /></ThemeIcon>}>
                    <List.Item>Structure de base Multi-écoles opérationnelle.</List.Item>
                    <List.Item>Gestion des élèves, classes et années scolaires.</List.Item>
                    <List.Item>Module de paiement des écolages (Recettes).</List.Item>
                    <List.Item>Authentification sécurisée des utilisateurs.</List.Item>
                  </List>
                </Stack>

              </Stack>
            </ScrollArea.Autosize>
          </Paper>

          <Paper withBorder radius="md" p="md" bg="gray.0">
            <Stack gap="sm">
              <Group gap="sm" wrap="nowrap" align="flex-start">
                <IconInfoCircle size={20} color="gray" style={{ flexShrink: 0, marginTop: 2 }} />
                <Text fz="xs" c="dimmed">
                  Pour tout problème technique ou demande de nouvelle fonctionnalité, 
                  veuillez contacter l'équipe de développement via notre page officielle.
                </Text>
              </Group>

              <Button 
                component="a" 
                href="https://www.facebook.com/profile.php?id=61561556410633"
                target="_blank" 
                variant="light" 
                color="blue" 
                fullWidth
                leftSection={<IconBrandFacebook size={18} />}
              >
                Suivre sur Facebook
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}

