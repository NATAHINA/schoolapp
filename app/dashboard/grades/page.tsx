'use client';

import { useState, useEffect } from 'react';
import { 
  Table, NumberInput, Button, Select, Paper, Title, 
  SimpleGrid, rem, TextInput, LoadingOverlay, Box, 
  Text, Group, Badge, ScrollArea, Stack, ActionIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconUserCircle, IconInfoCircle } from '@tabler/icons-react';

export default function GradesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [classList, setClassList] = useState<{ value: string; label: string }[]>([]);
  const [subjectList, setSubjectList] = useState<{ value: string; label: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const BIMESTRES = ['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4', 'Bimestre 5', 'Bimestre 6'];

  const form = useForm({
    initialValues: {
      classId: '',
      subjectId: '',
      period: '',
      grades: {} as Record<string, { value: number | string; comment: string }>,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolId = localStorage.getItem('school_id');
        const [resClasses, resSubjects] = await Promise.all([
          fetch(`/api/settings/classes?schoolId=${schoolId}`),
          fetch(`/api/settings/subjects?schoolId=${schoolId}`)
        ]);

        const classes = await resClasses.json();
        const subjects = await resSubjects.json();

        setClassList(classes.map((c: any) => ({ value: c._id, label: c.name })));
        setSubjectList(subjects.map((s: any) => ({ value: s._id, label: s.name })));
      } catch (error) {
        notifications.show({ title: 'Erreur', message: 'Échec du chargement initial', color: 'red' });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!form.values.classId) return;
      const activeSchoolId = localStorage.getItem('school_id');
      const anneeId = localStorage.getItem('active_annee_id');

      if (!activeSchoolId || !anneeId) {
        notifications.show({ title: 'Erreur', message: 'École ou Année scolaire non identifiée', color: 'red' });
        setLoading(false);
        return;
    }

      setLoading(true);
      try {
        const res = await fetch(`/api/students?classId=${form.values.classId}&academicYear=${anneeId}&schoolId=${activeSchoolId}`);
        const data = await res.json();

        const newGrades: any = {};
        data.forEach((s: any) => {
          newGrades[s._id] = { value: '', comment: '' };
        });

        form.setFieldValue('grades', newGrades);
        setStudents(data);
      } catch (error) {
        notifications.show({ title: 'Erreur', message: 'Impossible de charger les élèves', color: 'red' });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [form.values.classId]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.subjectId || !values.period) {
      notifications.show({ message: 'Sélectionnez une matière et un bimestre', color: 'orange', icon: <IconInfoCircle size={18}/> });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/grades/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: Object.entries(values.grades).map(([id, data]) => ({
            studentId: id,
            value: data.value,
            comment: data.comment
          })),
          subjectId: values.subjectId,
          period: values.period,
          classId: values.classId,
          schoolId: localStorage.getItem('school_id'),
          academicYear: localStorage.getItem('active_annee_id')
        }),
      });

      if (response.ok) {
        notifications.show({ title: 'Succès', message: 'Les notes ont été publiées', color: 'teal', icon: <IconDeviceFloppy size={18}/> });
        form.setValues({ classId: '', subjectId: '', period: '', grades: {} });
        setStudents([]);
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Échec de l\'enregistrement', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading || loadingData} overlayProps={{ blur: 1 }} />
      
      <Stack gap="lg">
        <Group justify="space-between" align="flex-end">
          <Stack gap={0}>
            <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>Saisie des Notes</Title>
            <Text fz="sm" c="dimmed">Évaluation par bimestre</Text>
          </Stack>
          {form.values.period && (
            <Badge size="lg" variant="dot" color="blue" visibleFrom="sm">
              Session : {form.values.period}
            </Badge>
          )}
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          {/* Section filtres "Sticky" sur desktop pour garder le contexte */}
          <Paper p="md" withBorder radius="md" mb="md" shadow="xs">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Select 
                label="Classe" 
                placeholder="Ex: 6ème A"
                data={classList} 
                searchable
                required
                {...form.getInputProps('classId')}
              />
              <Select 
                label="Matière" 
                placeholder="Ex: Mathématiques"
                data={subjectList} 
                searchable
                required
                {...form.getInputProps('subjectId')}
              />
              <Select 
                label="Bimestre" 
                placeholder="Sélectionner"
                data={BIMESTRES} 
                required
                {...form.getInputProps('period')}
              />
            </SimpleGrid>
          </Paper>

          
          {students.length > 0 ? (
            <Stack>
              <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
                <ScrollArea h={500} scrollbarSize={6}>
                  <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover style={{ minWidth: rem(700) }}>
                    <Table.Thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <Table.Tr>
                        <Table.Th>Élève</Table.Th>
                        <Table.Th style={{ width: rem(130) }}>Note / 20</Table.Th>
                        <Table.Th>Observation</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {students.map((student) => (
                        <Table.Tr key={student._id}>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <ActionIcon variant="subtle" color="gray" radius="xl">
                                <IconUserCircle size={20} />
                              </ActionIcon>
                              <Text fw={600} size="sm">{student.name}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              hideControls
                              min={0}
                              max={20}
                              decimalScale={2}
                              allowNegative={false}
                              placeholder="00.00"
                              styles={{ input: { textAlign: 'center', fontWeight: 700 } }}
                              {...form.getInputProps(`grades.${student._id}.value`)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput 
                              placeholder="Commentaire libre..." 
                              size="sm"
                              {...form.getInputProps(`grades.${student._id}.comment`)}
                            />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
              
            </Stack>
          ) : form.values.classId && !loading && (
            <Paper p="xl" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text c="dimmed">Aucun élève trouvé dans cette classe pour l'année active.</Text>
            </Paper>
          )}

          <Button 
            type="submit" 
            size="md"
            color="teal" 
            fullWidth 
            leftSection={<IconDeviceFloppy size={20}/>}
            disabled={!form.values.period || !form.values.subjectId}
          >
            Enregistrer le {form.values.period}
          </Button>

        </form>
      </Stack>
    </Box>
  );
}

