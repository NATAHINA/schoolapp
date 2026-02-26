'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Table, NumberInput, Button, Select, Paper, Title, 
  SimpleGrid, rem, TextInput, LoadingOverlay, Box, 
  Text, Group, Badge, ScrollArea, Stack, ActionIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconUserCircle, IconInfoCircle, IconPrinter, IconFileSpreadsheet } from '@tabler/icons-react';
import { useReactToPrint } from 'react-to-print';
import { GradesListPrint } from '@/components/GradesListPrint';
import * as XLSX from 'xlsx';

export default function GradesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [classList, setClassList] = useState<{ value: string; label: string }[]>([]);
  const [subjectList, setSubjectList] = useState<{ value: string; label: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [academicYearName, setAcademicYearName] = useState('');

  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const BIMESTRES = ['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4', 'Bimestre 5', 'Bimestre 6'];

  const form = useForm({
    initialValues: {
      classId: '',
      subjectId: '',
      period: '',
      grades: {} as Record<string, { value: number | string; comment: string }>,
    },
  });

  const exportToExcel = () => {
    if (students.length === 0) return;

    const excelData = students.map((student, index) => ({
      'N°': student?.matricule || index + 1,
      'Nom et Prénoms': student.name,
      'Note / 20': form.values.grades[student._id]?.value || '',
      'Observations': form.values.grades[student._id]?.comment || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notes");

    const maxWidth = 40; 
    worksheet['!cols'] = [{ wch: 20 }, { wch: maxWidth }, { wch: 10 }, { wch: 30 }];

    const fileName = `Notes_${classList.find(c => c.value === form.values.classId)?.label}_${form.values.period}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolId = localStorage.getItem('school_id');
        const anneeId = localStorage.getItem('active_annee_id');

        const [resClasses, resSubjects, resSchool, resAnnee] = await Promise.all([
          fetch(`/api/settings/classes?schoolId=${schoolId}`),
          fetch(`/api/settings/subjects?schoolId=${schoolId}`),
          fetch(`/api/schools/${schoolId}`),
          fetch(`/api/settings/annee/${anneeId}`)
        ]);

        const classes = await resClasses.json();
        const subjects = await resSubjects.json();
        const schoolData = await resSchool.json();
        const anneeData = await resAnnee.json();

        setClassList(classes.map((c: any) => ({ value: c._id, label: c.name })));
        setSubjectList(subjects.map((s: any) => ({ value: s._id, label: s.name })));
        setSchoolInfo(schoolData);
        setAcademicYearName(anneeData.name);

      } catch (error) {
        notifications.show({ title: 'Erreur', message: 'Échec du chargement', color: 'red' });
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



  useEffect(() => {
    const fetchExistingGrades = async () => {
      if (!form.values.classId || !form.values.subjectId || !form.values.period) return;

      const schoolId = localStorage.getItem('school_id');
      const academicYear = localStorage.getItem('active_annee_id');

      try {
        setLoading(true);
        const res = await fetch(
          `/api/grades/bulk/?classId=${form.values.classId}&subjectId=${form.values.subjectId}&period=${form.values.period}&academicYear=${academicYear}&schoolId=${schoolId}`
        );
        const existingGrades = await res.json();

        const gradesMap: Record<string, { value: number | string; comment: string }> = {};
        
        students.forEach(s => {
          gradesMap[s._id] = { value: '', comment: '' };
        });

        existingGrades.forEach((g: any) => {
          if (gradesMap[g.student]) {
            gradesMap[g.student] = { value: g.value, comment: g.comment || '' };
          }
        });

        form.setFieldValue('grades', gradesMap);
      } catch (error) {
        console.error("Erreur chargement notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingGrades();
  }, [form.values.classId, form.values.subjectId, form.values.period, students.length]); 



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

          <Group>
            {form.values.period && (
              <Badge size="lg" variant="dot" color="teal" visibleFrom="sm">
                Session : {form.values.period}
              </Badge>
            )}
            {students.length > 0 && (
              <>
                <Button 
                  variant="light" 
                  color="teal" 
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={exportToExcel}
                >
                  Export Excel
                </Button>

                <Button 
                  variant="light" 
                  color="gray" 
                  leftSection={<IconPrinter size={16} />}
                  onClick={() => handlePrint()}
                >
                  Imprimer
                </Button>
              </>
            )}
          </Group>
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
            mt="md"
            leftSection={<IconDeviceFloppy size={20}/>}
            disabled={!form.values.period || !form.values.subjectId}
          >
            Enregistrer le {form.values.period}
          </Button>

        </form>

        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <GradesListPrint 
              students={students}
              grades={form.values.grades}
              period={form.values.period}
              classLabel={classList.find(c => c.value === form.values.classId)?.label || ''}
              subjectLabel={subjectList.find(s => s.value === form.values.subjectId)?.label || ''}
              schoolInfo={schoolInfo}
              academicYearLabel={academicYearName || '---'}
            />
          </div>
        </div>

      </Stack>
    </Box>
  );
}

