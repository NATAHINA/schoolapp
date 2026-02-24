'use client';

import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { IconBellRinging, IconCheck, IconHistory, 
IconAlertCircle, IconBook, IconUser, IconClock, IconChartDots  } from '@tabler/icons-react';
import Link from 'next/link';
import { 
  Title, Paper, Table, Button, Group, Select, Text, Stack, Card, 
  Center, Loader, Box, SimpleGrid, SegmentedControl, TextInput 
} from '@mantine/core';

interface SelectOption {
  value: string;
  label: string;
}

export default function AttendancePage() {
  
  const [classOptions, setClassOptions] = useState<SelectOption[]>([]);
  const [subjects, setSubjects] = useState<SelectOption[]>([]);
  const [teachers, setTeachers] = useState<SelectOption[]>([]);
  
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>('Matin');

  const [students, setStudents] = useState<any[]>([]);
  const [absents, setAbsents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const [pageLoading, setPageLoading] = useState(true);

  
  useEffect(() => {
    const schoolId = localStorage.getItem('school_id');
    const fetchData = async () => {
      try {
        const [resCl, resSub, resTeach] = await Promise.all([
          fetch(`/api/settings/classes?schoolId=${schoolId}`),
          fetch(`/api/settings/subjects?schoolId=${schoolId}`),
          fetch(`/api/teachers?schoolId=${schoolId}`)
        ]);
        
        const dCl = await resCl.json();
        const dSub = await resSub.json();
        const dTeach = await resTeach.json();

        if (Array.isArray(dCl)) setClassOptions(dCl.map(c => ({ value: c._id, label: c.name })));
        if (Array.isArray(dSub)) setSubjects(dSub.map(s => ({ value: s._id, label: s.name })));
        if (Array.isArray(dTeach)) setTeachers(dTeach.map(t => ({ value: t._id, label: t.name })));
      } catch (e) {
        console.error(e);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const schoolId = localStorage.getItem('school_id');
      const academicYear = localStorage.getItem('active_annee_id');

      if (!schoolId && !academicYear) return;

      fetch(`/api/students?classId=${selectedClass}&schoolId=${schoolId}&academicYear=${academicYear}`)
        .then(res => res.json())
        .then(data => setStudents(Array.isArray(data) ? data : []));
    }
  }, [selectedClass]);

  useEffect(() => {
    if (students.length > 0) {
      const initialMap: Record<string, any> = {};
      students.forEach((s: any) => {
        initialMap[s._id] = { status: 'Present', arrivalTime: '', justification: '' };
      });
      setAttendanceData(initialMap);
    }
  }, [students]);

  const updateStudentStatus = (id: string, field: string, value: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleToggleStudent = (id: string) => {
    setAbsents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const submitAttendance = async () => {
    
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      notifications.show({ title: 'Erreur', message: 'Remplissez tous les champs du cours', color: 'red' });
      return;
    }
    
    setLoading(true);
    try {
      const schoolId = localStorage.getItem('school_id');
      const academicYear = localStorage.getItem('active_annee_id');
     
      const attendanceRecords = students.map((s: any) => ({
        studentId: s._id,
        class: selectedClass,
        subjectId: selectedSubject,
        teacherId: selectedTeacher,
        academicYear: localStorage.getItem('active_annee_id'),
        schoolId: localStorage.getItem('school_id'),
        period: selectedPeriod,
        date: new Date(),
        status: attendanceData[s._id].status,
        arrivalTime: attendanceData[s._id].arrivalTime,
        justificationReason: attendanceData[s._id].justification,
        isJustified: !!attendanceData[s._id].justification
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: attendanceRecords }),
      });

      if (!res.ok) throw new Error("Échec de l'enregistrement");

      notifications.show({ 
        title: 'Appel validé', 
        message: 'La présence a été enregistrée avec succès.', 
        color: 'teal', 
        icon: <IconCheck size={16} /> 
      });
      setAbsents([]);
    } catch (error: any) {
      notifications.show({ title: 'Erreur', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Center h="80vh"><Loader color="teal" /></Center>;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2} fw={800}>Feuille de Présence</Title>
        <Group>
          <Button variant="light" leftSection={<IconHistory size={18} />} component={Link} href="/dashboard/attendance/history">
            Historique
          </Button>
          <Button variant="filled" leftSection={<IconChartDots size={18} />} component={Link} href="/dashboard/attendance/stats">
            Statistique
          </Button>
        </Group>
      </Group>

      {/* FILTRES DE COURS ET ENSEIGNANT */}
      <Card withBorder radius="md" shadow="sm">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <Select
            label="Classe"
            placeholder="Choisir"
            data={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            searchable
          />
          <Select
            label="Enseignant"
            placeholder="Qui fait l'appel ?"
            leftSection={<IconUser size={16} />}
            data={teachers}
            value={selectedTeacher}
            onChange={setSelectedTeacher}
            searchable
          />
          <Select
            label="Cours / Matière"
            placeholder="Ex: Mathématiques"
            leftSection={<IconBook size={16} />}
            data={subjects}
            value={selectedSubject}
            onChange={setSelectedSubject}
            searchable
          />
          <Select
            label="Période"
            data={['Matin', 'Après-midi']}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </SimpleGrid>
      </Card>

      {selectedClass && (
        <Paper withBorder radius="md" shadow="sm" style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="md">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Élève</Table.Th>
                <Table.Th>Statut</Table.Th>
                <Table.Th>Détails (Retard/Justif.)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {students.map((student: any) => {
                const current = attendanceData[student._id] || { status: 'Present' };
                return (
                  <Table.Tr key={student._id}>
                    <Table.Td>
                      <Text fz="sm" fw={600}>{student.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <SegmentedControl
                        size="xs"
                        color={current.status === 'Present' ? 'teal' : 'red'}
                        value={current.status}
                        onChange={(val) => updateStudentStatus(student._id, 'status', val)}
                        data={[
                          { label: 'Présent', value: 'Present' },
                          { label: 'Retard', value: 'Retard' },
                          { label: 'Absent', value: 'Absent' },
                        ]}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {current.status === 'Retard' && (
                          <TextInput
                            placeholder="Ex: 08:15"
                            size="xs"
                            leftSection={<IconClock size={12} />}
                            value={current.arrivalTime}
                            onChange={(e) => updateStudentStatus(student._id, 'arrivalTime', e.target.value)}
                            style={{ width: 90 }}
                          />
                        )}
                        {(current.status === 'Absent' || current.status === 'Retard') && (
                          <TextInput
                            placeholder="Motif / Justification"
                            size="xs"
                            value={current.justification}
                            onChange={(e) => updateStudentStatus(student._id, 'justification', e.target.value)}
                            style={{ flex: 1, minWidth: 150 }}
                          />
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
          
          <Box p="md">
            <Button fullWidth size="md" onClick={submitAttendance} loading={loading} color="teal">
              Valider l'appel
            </Button>
          </Box>
        </Paper>
      )}

    </Stack>
  );
}

