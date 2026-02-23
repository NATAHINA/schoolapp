'use client';

import { useState, useEffect } from 'react';
import { 
  Container, Title, Text, SimpleGrid, Paper, Badge, Group, 
  Stack, Loader, Center, Avatar, Alert, ThemeIcon, rem,
  Modal, Button, Timeline, Grid, Divider, Progress
} from '@mantine/core';
import { 
  IconUser, IconSchool, IconCalendarStats, IconInfoCircle, IconArrowRight,
  IconCheck, IconFileText, IconTrophy, IconChartBar
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

// --- INTERFACES ---
interface SubjectDetail {
  subjectName: string;
  grade: number;
  coeff: number;
  weightedGrade: number;
  teacherComment?: string;
}

interface Student {
  _id: string;
  matricule: string;
  name: string;
  gender?: string;
  date_naissance?: string | Date;
  lieu_naissance?: string;
  class?: { name: string };
  stats?: {
    average: number | null;
    rank: number | null;
    period: string | null;
    classSize: number | null;
    subjectsDetails: SubjectDetail[];
  };
}

interface ParentData {
  name: string;
  academicYear: string;
  children: Student[];
}

export default function ParentDashboard() {
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);

  useEffect(() => {
    const fetchParentData = async () => {
      const userId = localStorage.getItem('user_id');
      const schoolId = localStorage.getItem('school_id');

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/parents/my-children?userId=${userId}&schoolId=${schoolId}`);
        const result = await res.json();

        if (res.ok) {
          setData(result);
        } else {
          notifications.show({ title: 'Erreur', message: result.error, color: 'red' });
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, []);

  const handleOpenDetails = (child: Student) => {
    setSelectedChild(child);
    open();
  };

  if (loading) return <Center h="80vh"><Loader size="md" color="teal" variant="dots" /></Center>;

  if (!data) return (
    <Center h="80vh">
      <Stack align="center" gap="xs">
        <IconInfoCircle size={50} color="gray" />
        <Text fz="lg" fw={700}>Profil introuvable</Text>
        <Button variant="light" onClick={() => window.location.reload()}>Réessayer</Button>
      </Stack>
    </Center>
  );

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="flex-end">
            <div>
              <Title order={1} fw={900} style={{ letterSpacing: rem(-1) }}>Espace Parent</Title>
              <Text c="dimmed" fz="lg">Bienvenue, <b>{data.name}</b>.</Text>
            </div>
            <Badge size="xl" variant="filled" color='teal'>
              Année Scolaire {data.academicYear}
            </Badge>
          </Group>
        </header>

        <Title order={3}>Suivi des élèves ({data.children?.length || 0})</Title>

        {data.children && data.children.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {data.children.map((child) => (
              <Paper key={child._id} withBorder p="xl" radius="lg" shadow="sm">
                <Group justify="space-between" mb="lg">
                  <Group>
                    <Avatar size={65} radius="md" color="teal" variant="light">
                      {child.name.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text fw={800} fz="xl">{child.name}</Text>
                      <Group gap="xs">
                        <Badge variant="outline" color="teal">{child.class?.name}</Badge>
                        <Text fz="xs" c="dimmed" fw={500}>N°: {child.matricule || 'N/A'}</Text>
                      </Group>

                      {(child.date_naissance || child.lieu_naissance) && (
                      <Text fz="xs" c="dimmed" mt={4}>
                        Né(e) le {child.date_naissance ? new Date(child.date_naissance).toLocaleDateString('fr-FR') : '?'} à {child.lieu_naissance || '?'}
                      </Text>
                      )}
                    </div>
                  </Group>
                </Group>

                <SimpleGrid cols={2} spacing="md">
                  {/* Bloc Moyenne */}
                  <Paper withBorder p="md" radius="md">
                    <Stack gap={0} align="center">
                      <Text fz="xs" fw={700} c="teal" tt="uppercase">Moyenne</Text>
                      <Text fw={900} fz="h2" c="teal">
                        {child.stats?.average ? child.stats.average.toFixed(2) : '--'}
                      </Text>
                      <Text fz="xs" c="dimmed">{child.stats?.period || 'Aucun bulletin'}</Text>
                    </Stack>
                  </Paper>

                  {/* Bloc Rang */}
                  <Paper withBorder p="md" radius="md">
                    <Stack gap={0} align="center">
                      <Text fz="xs" fw={700} tt="uppercase" c="blue" >Rang</Text>
                      <Text fw={900} fz="h2" c="blue" >
                        {child.stats?.rank ? `${child.stats.rank}e` : '--'}
                      </Text>
                      <Text fz="xs" c="dimmed">sur {child.stats?.classSize || '--'}</Text>
                    </Stack>
                  </Paper>
                </SimpleGrid>

                <Button 
                  fullWidth 
                  variant="light" 
                  color="" 
                  mt="xl" 
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => handleOpenDetails(child)}
                >
                  Consulter le dossier complet
                </Button>
              </Paper>
            ))}
          </SimpleGrid>
        ) : (
          <Alert color="orange" icon={<IconInfoCircle />}>
            Aucun enfant n'est rattaché à ce compte.
          </Alert>
        )}
      </Stack>

      {/* MODAL DE DÉTAILS */}
      <Modal 
        opened={opened} 
        onClose={close} 
        size="xl" 
        radius="lg"
        title={<Text fw={700} fz="lg">Dossier Académique</Text>}
      >
        {selectedChild && (
          <Stack gap="xl">
            <Group justify="space-between" align="flex-start">
              <Group>
                <Avatar size={70} radius="xl" color="teal">{selectedChild.name[0]}</Avatar>
                <div>
                  <SimpleGrid cols={2} spacing={4} mt={5}>
                    <Group gap={5}>
                      <IconSchool size={14} color="gray" />
                      <Text fz="sm" c="dimmed">{selectedChild.class?.name}</Text>
                    </Group>
                    <Group gap={5}>
                      <IconFileText size={14} color="gray" />
                      <Text fz="sm" c="dimmed">Matricule N°: {selectedChild.matricule}</Text>
                    </Group>
                    <Group gap={5}>
                      <IconCalendarStats size={14} color="gray" />
                      <Text fz="sm" c="dimmed">
                        {selectedChild.date_naissance ? new Date(selectedChild.date_naissance).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </Text>
                    </Group>
                    <Group gap={5}>
                      <IconInfoCircle size={14} color="gray" />
                      <Text fz="sm" c="dimmed">{selectedChild.lieu_naissance || 'Lieu inconnu'}</Text>
                    </Group>
                  </SimpleGrid>
                  
                </div>
              </Group>
              <Stack gap={2} align="flex-end">
                <Text fz="xs" c="dimmed">Moyenne Générale</Text>
                <Badge size="xl" color="teal" variant="filled" h={40} fz="lg">
                  {selectedChild.stats?.average?.toFixed(2) || '--'} / 20
                </Badge>
              </Stack>
            </Group>

            <Divider label="Notes par Matière" labelPosition="center" />

            {selectedChild.stats?.subjectsDetails ? (
              <Stack gap="sm">
                {selectedChild.stats.subjectsDetails.map((sub, index) => (
                  <Paper key={index} withBorder p="sm" radius="md">
                    <Grid align="center">
                      <Grid.Col span={5}>
                        <Text fw={600}>{sub.subjectName}</Text>
                        <Text fz="xs" c="dimmed">Coeff: {sub.coeff}</Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Progress 
                          value={(sub.grade / 20) * 100} 
                          color={sub.grade >= 10 ? 'teal' : 'red'} 
                          size="sm" 
                          radius="xl" 
                        />
                      </Grid.Col>
                      <Grid.Col span={3} ta="right">
                        <Text fw={700} c={sub.grade >= 10 ? 'teal' : 'red'}>{sub.grade} / 20</Text>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Text ta="center" c="dimmed">Aucune note détaillée disponible pour cette période.</Text>
            )}

            <Button fullWidth color="teal" variant="outline" onClick={close}>Fermer le dossier</Button>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}