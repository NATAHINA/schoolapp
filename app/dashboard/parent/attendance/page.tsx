'use client';
import { useState, useEffect } from 'react';
import { Container,Stack, Title, Accordion, Table, Badge, 
Text, Group, Paper, Center, Loader, Select, 
SimpleGrid,ThemeIcon  } from '@mantine/core';
import { IconCalendarStats, IconCircleCheck, IconFilter ,
IconCircleX, IconClock, IconUserOff, IconShieldCheck  } from '@tabler/icons-react';


export default function AttendancePage() {
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string | null>('Toutes');

  const globalStats = childrenData.reduce((acc, child) => {
    acc.abs += child.stats?.totalAbsences || 0;
    acc.late += child.stats?.totalLate || 0;
    acc.justified += child.stats?.totalJustified || 0;
    return acc;
  }, { abs: 0, late: 0, justified: 0 });

  const fetchData = async () => {
    const userId = localStorage.getItem('user_id');
    const anneeId = localStorage.getItem('active_annee_id');
    setLoading(true);
    
    try {
      const url = `/api/parents/my-children/attendance?userId=${userId}&academicYearId=${anneeId}${period !== 'Toutes' ? `&period=${period}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setChildrenData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);


  if (loading) return <Center h="80vh"><Loader color="teal" /></Center>;

  return (
    <Container size="lg" py="xl">

      <Stack gap="xl">
        {!loading && childrenData.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Paper withBorder p="md" radius="md" shadow="xs">
              <Group>
                <ThemeIcon size="xl" radius="md" color="red" variant="light">
                  <IconUserOff size={24} />
                </ThemeIcon>
                <div>
                  <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>Absences Totales</Text>
                  <Text fz="xl" fw={700}>{globalStats.abs}</Text>
                </div>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md" shadow="xs">
              <Group>
                <ThemeIcon size="xl" radius="md" color="orange" variant="light">
                  <IconClock size={24} />
                </ThemeIcon>
                <div>
                  <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>Retards Totaux</Text>
                  <Text fz="xl" fw={700}>{globalStats.late}</Text>
                </div>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md" shadow="xs">
              <Group>
                <ThemeIcon size="xl" radius="md" color="teal" variant="light">
                  <IconShieldCheck size={24} />
                </ThemeIcon>
                <div>
                  <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>Cas Justifiés</Text>
                  <Text fz="xl" fw={700}>{globalStats.justified}</Text>
                </div>
              </Group>
            </Paper>
          </SimpleGrid>
        )}

        <Group justify="space-between" align="flex-end">
            <div>
              <Title order={2}>Suivi de l'Assiduité</Title>
              <Text fz="sm" c="dimmed">Consultez les absences et retards par période</Text>
            </div>
            
            <Select
              label="Filtrer par période"
              placeholder="Choisir une période"
              leftSection={<IconFilter size={16} />}
              data={['Toutes', 'Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Semestre 1', 'Semestre 2']}
              value={period}
              onChange={setPeriod}
              w={200}
            />
          </Group>
      
        <Accordion 
          variant="separated" >
          {childrenData.map((child) => (
            <Accordion.Item key={child._id} value={child._id}>

              <Accordion.Control icon={<IconCalendarStats size={20} color="teal" />}>
                <Group justify="space-between">
                  <Text fw={700}>{child.name || "Élève Inconnu"}</Text>
                  <Group gap="xs">
                    <Badge color="red" variant="light">
                      {child.absences.filter((a: any) => a.status === 'Absent').length} Absence(s)
                    </Badge>
                    <Badge color="orange" variant="light">
                      {child.absences.filter((a: any) => a.status === 'Late' || a.status === 'Retard').length} Retard(s)
                    </Badge>
                  </Group>
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                {child.absences.length > 0 ? (
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Matière</Table.Th>
                      <Table.Th>Professeur</Table.Th>
                      <Table.Th>Période</Table.Th>
                      <Table.Th>Statut</Table.Th>
                      <Table.Th>Justifié</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {child.absences.map((abs: any) => (
                    <Table.Tr key={abs._id}>
                      <Table.Td>{new Date(abs.date).toLocaleDateString()}</Table.Td>
                      
                      <Table.Td>
                        <Text fw={500}>{abs.subjectId?.name || ''}</Text>
                      </Table.Td>
                      
                      <Table.Td>
                        <Text fz="sm" c="dimmed">{abs.teacherId?.name || ''}</Text>
                      </Table.Td>

                      <Table.Td>{abs.period}</Table.Td>
                      <Table.Td>
                        <Badge variant="dot" color={abs.status === 'Absent' ? 'red' : 'orange'}>
                          {abs.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {abs.isJustified ? (
                          <Badge color="green" variant="light">Justifié</Badge>
                        ) : (
                          <Badge color="gray" variant="light">Non justifié</Badge>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  </Table.Tbody>
                </Table>
                ) : (
                  <Text ta="center" py="md" c="dimmed">Aucune absence enregistrée.</Text>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Stack>
    </Container>
  );
}