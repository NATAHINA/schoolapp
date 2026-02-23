'use client';
import { useState, useEffect } from 'react';
import { 
  Container, Title, Paper, Text, Group, Button, 
  Table, Badge, Tabs, Loader, Center, Accordion, Stack, Alert 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChartBar, IconDownload, IconFileAnalytics, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { generateStudentReport } from '@/lib/generatePDF';

export default function GradesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('user_id');
      const anneeId = localStorage.getItem('active_annee_id');
      const schoolId = localStorage.getItem('school_id');

      if (!userId || !schoolId) {
        setError("Session ou établissement non identifié. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      try {
        const url = `/api/parents/my-children/grades?userId=${userId}&schoolId=${schoolId}${anneeId ? `&academicYearId=${anneeId}` : ''}`;
        const res = await fetch(url);
        const result = await res.json();

        if (result.error) throw new Error(result.error);

        // On gère ici le fait que l'API renvoie { gradesReport, schoolInfo }
        setData(Array.isArray(result.gradesReport) ? result.gradesReport : []);
        setSchoolInfo(result.schoolInfo);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = (report: any) => {
    if (!schoolInfo) {
      notifications.show({ 
        title: 'Erreur', 
        message: 'Les informations de l\'école ne sont pas disponibles.', 
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }
    
    try {
      generateStudentReport(report, schoolInfo);
      notifications.show({
        title: 'Succès',
        message: 'Génération du bulletin terminée.',
        color: 'teal',
        icon: <IconCheck size={16} />
      });
    } catch (err) {
      notifications.show({ title: 'Erreur', message: 'Échec de la génération PDF', color: 'red' });
    }
  };

  if (loading) return <Center h="80vh"><Loader color="teal" variant="dots" size="md" /></Center>;

  if (error) return (
    <Container size="sm" py="xl">
      <Alert icon={<IconAlertCircle size={16} />} title="Erreur de chargement" color="red">
        {error}
      </Alert>
    </Container>
  );

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl" fw={900}>Notes & Résultats</Title>

      {data.length === 0 ? (
        <Alert color="blue" icon={<IconAlertCircle size={16} />}>
          Aucune donnée de notation trouvée pour vos enfants sur cette période.
        </Alert>
      ) : (
        <Tabs defaultValue="grades" color="teal">
          <Tabs.List mb="lg">
            <Tabs.Tab value="grades" leftSection={<IconChartBar size={16} />}>Notes détaillées</Tabs.Tab>
            <Tabs.Tab value="reports" leftSection={<IconDownload size={16} />}>Bulletins PDF</Tabs.Tab>
          </Tabs.List>

          {/* SECTION : TABLEAU DES NOTES */}
          <Tabs.Panel value="grades">
            <Accordion 
              variant="separated" 
              defaultValue={data.length > 0 ? data[0]._id : null}>
              {data.map((report) => (
                <Accordion.Item key={report.studentId} value={report.studentId}>
                  <Accordion.Control>
                    <Group justify="space-between" pr="md">
                      <Text fw={700} fz="lg">{report.studentName}</Text>
                      {report.average ? (
                        <Badge size="xl" variant="light" color={parseFloat(report.average) >= 10 ? 'teal' : 'red'}>
                          Moyenne: {report.average}/20
                        </Badge>
                      ) : (
                        <Badge color="gray">Aucune note</Badge>
                      )}
                      <Text fz="xs" c="dimmed">
                        Min: {report.classStats.min} | Moy: {report.classStats.avg} | Max: {report.classStats.max}
                      </Text>
                    </Group>
                  </Accordion.Control>
                  
                  <Accordion.Panel>
                    {report.grades && report.grades.length > 0 ? (
                      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                        <Table verticalSpacing="md" highlightOnHover striped>
                          <Table.Thead bg="gray.0">
                            <Table.Tr>
                              <Table.Th>Matière</Table.Th>
                              <Table.Th ta="center">Note / 20</Table.Th>
                              <Table.Th ta="center">Coeff.</Table.Th>
                              <Table.Th>Période</Table.Th>
                              <Table.Th>Observation</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {report.grades.map((g: any) => (
                              <Table.Tr key={g._id}>
                                <Table.Td fw={700}>{g.subjectName}</Table.Td>
                                <Table.Td ta="center">
                                  <Text fw={700} c={g.value >= 10 ? 'teal.7' : 'red.7'}>
                                    {Number(g.value).toFixed(2)}
                                  </Text>
                                </Table.Td>
                                <Table.Td ta="center">{g.coefficient}</Table.Td>
                                <Table.Td><Badge variant="outline" size="sm">{g.period}</Badge></Table.Td>
                                <Table.Td><Text size="xs" c="dimmed">{g.comment || '-'}</Text></Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Paper>
                    ) : (
                      <Text ta="center" py="xl" c="dimmed">Aucun détail disponible.</Text>
                    )}
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Tabs.Panel>

          {/* SECTION : BULLETINS PDF */}
          <Tabs.Panel value="reports">
            <Stack gap="xl" mt="md">
              {data.map((report) => (
                <Paper key={`rep-${report.studentId}`} withBorder p="lg" radius="md" shadow="sm">
                  <Group justify="space-between">
                    <Group>
                      <IconFileAnalytics size={32} color="var(--mantine-color-teal-6)" />
                      <div>
                        <Text fw={700} fz="lg">{report.studentName}</Text>
                        <Text fz="xs" c="dimmed">Bulletin de l'année scolaire en cours</Text>
                      </div>
                    </Group>
                    
                    <Button 
                      leftSection={<IconDownload size={16} />}
                      color="teal"
                      disabled={!report.grades || report.grades.length === 0}
                      onClick={() => handleDownload(report)}
                    >
                      Générer le PDF
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  );
}