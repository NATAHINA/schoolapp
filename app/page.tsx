'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Badge, 
  SimpleGrid, 
  Card, 
  ThemeIcon, 
  ActionIcon,Accordion, Overlay,
  useMantineColorScheme, 
  useComputedColorScheme,
  rem, Tooltip, Box, Stack, Anchor 
} from '@mantine/core';
import { 
  IconDeviceMobileMessage, 
  IconSchool, 
  IconChartBar, 
  IconUsers, 
  IconSun,
  IconMoon, IconClock, IconCheck,
  IconBackpack,IconArrowRight,
  IconLogin, IconUserPlus,
  IconDatabase, IconCloudLock,
  IconHeadset, IconFileImport, IconDevices, IconLockCheck 
} from '@tabler/icons-react';
import Link from 'next/link';

const features = [
  {
    title: 'Gestion Administrative',
    description: 'Centralisez les dossiers élèves, les classes et les inscriptions en quelques secondes.',
    icon: IconUsers,
    color: 'teal',
  },
  {
    title: 'Suivi Académique',
    description: 'Générez des bulletins automatiques et suivez la progression des notes en temps réel.',
    icon: IconChartBar,
    color: 'blue',
  },
  {
    title: 'Cloud & Sécurité',
    description: 'Vos données sont cryptées et accessibles partout, même sur tablette et mobile.',
    icon: IconCloudLock,
    color: 'indigo',
  },
  {
    title: 'Historique de Paiement',
    description: 'Suivez les frais de scolarité et générez des reçus de caisse instantanément.',
    icon: IconDatabase,
    color: 'cyan',
  },
];

const screenshots = [
  {
    title: 'Tableau de bord intelligent',
    category: 'Analyse',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    description: 'Visualisez vos indicateurs clés en un clin d\'œil.'
  },
  {
    title: 'Gestion des inscriptions',
    category: 'Administration',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    description: 'Dossiers élèves complets et numérisés.'
  },
  {
    title: 'Interface Mobile',
    category: 'Accessibilité',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop',
    description: 'Accédez à vos données partout, tout le temps.'
  }
];

export default function HomePage() {

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  // useEffect ne s'exécute que sur le client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ActionIcon variant="default" size="lg" disabled />;
  }

  return (
    <Container size="lg" py="xl">
      <Group h="100%" px="md" align="center" justify="space-between">
        <Group>
          <Group gap="xs">
            <IconBackpack size={30} color="var(--mantine-color-teal-6)" stroke={1.5} />
            <Title visibleFrom="sm" order={3} fz={22} fw={800} c="teal.7" style={{ letterSpacing: '-0.5px' }}>
              EduManager
            </Title>
          </Group>
        </Group>
        <Group gap="xs">
          <ActionIcon
            onClick={() => toggleColorScheme()}
            variant="default"
            size="lg"
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? (
              <IconSun size={20} stroke={1.5} />
            ) : (
              <IconMoon size={20} stroke={1.5} />
            )}
          </ActionIcon>

          <Tooltip label="Connexion" openDelay={500}>
            <ActionIcon component={Link} href="/auth/login" variant="outline" size="lg" hiddenFrom="sm">
              <IconLogin size={20} />
            </ActionIcon>
          </Tooltip>

          <Button component={Link} href="/auth/login" variant="outline" visibleFrom="sm">
            Connexion
          </Button>

          <Tooltip label="Créer un compte école" openDelay={500}>
            <ActionIcon component={Link} href="/auth/register" variant="filled" size="lg" hiddenFrom="sm">
              <IconUserPlus size={20} />
            </ActionIcon>
          </Tooltip>

          <Button component={Link} href="/auth/register" variant="filled" visibleFrom="sm">
            S'inscrire
          </Button>
        </Group>
      </Group>

      {/* --- SECTION HERO --- */}
      
      <Stack align="center" mt={80} mb={100} gap="xl">
          <Badge variant="light" size="lg" radius="xl" py="md" px="xl" color="teal">
            Solution de Gestion Scolaire 2026
          </Badge>
          
          <Title order={2} ta="center" fz={{ base: rem(40), md: rem(64) }} fw={800} style={{ lineHeight: 1.1 }}>
            L'excellence numérique pour <br />
            <Text span variant="gradient" gradient={{ from: 'teal', to: 'blue' }} inherit>
              votre établissement scolaire
            </Text>
          </Title>

          <Text c="dimmed" fz="xl" ta="center" maw={700} mx="auto">
            La solution tout-en-un pour la gestion des élèves, des finances et des résultats. 
            Pensée pour les directeurs d'écoles modernes qui veulent gagner 10h par semaine.
          </Text>

          <Group justify="center">
            <Button size="lg" component={Link} href="/auth/login">
              Accéder au Dashboard
            </Button>
            <Button size="lg" variant="outline" component={Link} href="/auth/register">
              Inscrire mon école
            </Button>
          </Group>
        </Stack>

      {/* --- SECTION FEATURES --- */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mb={100}>
          {[
            { label: 'Gain de temps', value: '+40%', desc: 'Moins de paperasse' },
            { label: 'Fiabilité', value: '100%', desc: 'Données sécurisées' },
            { label: 'Efficacité', value: 'Zéro', desc: 'Oubli de facturation' },
          ].map((stat, i) => (
            <Card key={i} withBorder padding="lg" radius="md" ta="center" bg="transparent">
              <Text fz="xs" tt="uppercase" fw={700} c="dimmed">{stat.label}</Text>
              <Text fz="xl" fw={900} c="teal">{stat.value}</Text>
              <Text fz="sm" c="dimmed">{stat.desc}</Text>
            </Card>
          ))}
        </SimpleGrid>

        {/* --- FEATURES BENTO --- */}
        <Title order={2} ta="center" mb={50} fw={800}>Pourquoi choisir EduManager ?</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
          {features.map((feature) => (
            <Card key={feature.title} shadow="sm" radius="lg" padding="xl" withBorder style={{ transition: 'transform 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <ThemeIcon size={54} radius="md" variant="light" color={feature.color}>
                <feature.icon style={{ width: rem(30), height: rem(30) }} stroke={1.5} />
              </ThemeIcon>
              <Text fz="lg" fw={700} mt="md">
                {feature.title}
              </Text>
              <Text fz="sm" c="dimmed" mt="sm" style={{ lineHeight: 1.6 }}>
                {feature.description}
              </Text>
              <Group gap={4} mt="xl">
                <IconCheck size={16} color="var(--mantine-color-teal-filled)" />
                <Text fz="xs" fw={700}>INCLUS</Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        {/* --- SECTION GALERIE / SCREENSHOTS --- */}
        <Box mt={100}>
          <Stack align="center" mb={50}>
            <Badge color="blue" variant="light">Aperçu de l'interface</Badge>
            <Title order={2} fw={800} ta="center">
              Une interface intuitive pour un pilotage simplifié
            </Title>
            <Text c="dimmed" ta="center" maw={600}>
              Découvrez comment EduManager transforme la complexité administrative en une expérience fluide et visuelle.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {screenshots.map((item, index) => (
              <Card
                key={index}
                p={0}
                radius="lg"
                withBorder
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                className="screenshot-card"
              >
                <Box style={{ position: 'relative', height: rem(220) }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <Badge 
                    pos="absolute" 
                    top={15} 
                    left={15} 
                    variant="filled" 
                    color="teal" 
                    style={{ zIndex: 2 }}
                  >
                    {item.category}
                  </Badge>
                </Box>

                <Stack p="lg" gap="xs">
                  <Text fw={700} fz="lg">{item.title}</Text>
                  <Text fz="sm" c="dimmed" lineClamp={2}>
                    {item.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Box>


        {/* --- SECTION QUESTIONS --- */}
        <Box mt={120} mb={60} maw={800} mx="auto">
          <Stack align="center" mb="xl">
            <Badge color="teal" variant="light" size="lg">FAQ</Badge>
            <Title order={2} ta="center" fw={800}>Tout savoir sur EduManager</Title>
            <Text c="dimmed" ta="center">Des réponses claires pour vous accompagner dans votre transformation numérique.</Text>
          </Stack>

          <Accordion variant="separated" radius="lg" chevronPosition="right" defaultValue="security">
            
            <Accordion.Item value="security" style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
              <Accordion.Control icon={<IconLockCheck size={20} color="var(--mantine-color-teal-6)"/>}>
                Comment la confidentialité de mes données est-elle garantie ?
              </Accordion.Control>
              <Accordion.Panel>
                La protection de vos données scolaires est notre priorité. Nous utilisons un cryptage de bout en bout (SSL) et vos informations sont répliquées en temps réel sur plusieurs serveurs sécurisés pour garantir une disponibilité totale et une protection contre toute perte technique.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="setup" style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
              <Accordion.Control icon={<IconFileImport size={20} color="var(--mantine-color-blue-6)"/>}>
                Puis-je importer mes données existantes depuis Excel ?
              </Accordion.Control>
              <Accordion.Panel>
                Absolument. Vous n'avez pas besoin de tout ressaisir manuellement. EduManager inclut un outil d'importation intelligent qui reconnaît vos fichiers Excel pour intégrer vos listes d'élèves, de parents et de classes en quelques clics.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="mobile" style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
              <Accordion.Control icon={<IconDevices size={20} color="var(--mantine-color-indigo-6)"/>}>
                L'application est-elle accessible pour les parents ?
              </Accordion.Control>
              <Accordion.Panel>
                Oui, EduManager propose un espace dédié aux parents. Ils peuvent consulter les notes, le rang et les frais de scolarité de leurs enfants depuis n'importe quel smartphone ou tablette, renforçant ainsi le lien entre l'école et les familles.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="support" style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
              <Accordion.Control icon={<IconHeadset size={20} color="var(--mantine-color-cyan-6)"/>}>
                Quel accompagnement proposez-vous en cas de besoin ?
              </Accordion.Control>
              <Accordion.Panel>
                Nous proposons une assistance par chat intégrée directement dans votre dashboard, ainsi que des guides interactifs pour vous aider à tirer le meilleur parti de chaque fonctionnalité.
              </Accordion.Panel>
            </Accordion.Item>

          </Accordion>
        </Box>

        {/* --- FOOTER --- */}
        <Box py={60} style={{ borderTop: `1px solid ${colorScheme === 'dark' ? '#333' : '#eee'}` }}>
          <Stack align="center" gap="xs">
            <Group gap="xs">
              <IconBackpack size={24} color="gray" />
              <Text fw={700} c="dimmed">EduManager</Text>
            </Group>
            <Text c="dimmed" fz="sm" ta="center" maw={400} style={{ lineHeight: 1.5 }}>
              Simplifiez votre gestion quotidienne et offrez à votre établissement 
              l'outil qu'il mérite pour briller.
            </Text>

            <Group gap="xs">
              <Anchor href="/cgu" size="sm" c="dimmed" underline="hover">
                CGU
              </Anchor>
              
              <Text c="dimmed" size="sm">•</Text>
              
              <Anchor href="/confidentialite" size="sm" c="dimmed" underline="hover">
                Politique de Confidentialité
              </Anchor>
            </Group>

            <Text fz="xs" c="dimmed" mt="md">
              © 2026 EduManager. Fait avec passion pour l'éducation.
            </Text>
          </Stack>
        </Box>
    </Container>
  );
}

