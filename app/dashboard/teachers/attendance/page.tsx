'use client';

import { useState, useEffect } from 'react';
import { 
  Table, Group, Text, Radio, Button, Paper, Title, rem,SimpleGrid, ScrollArea,
  Stack, Select, LoadingOverlay, Card, Badge , Menu, ActionIcon, TextInput, Flex
} from '@mantine/core';

import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { 
  IconDeviceFloppy, IconRefresh, IconDownload, IconFileSpreadsheet, 
  IconFileTypePdf, IconClock, IconMessage2 
} from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
dayjs.locale('fr');

export default function TeacherAttendancePage() {
  const [date, setDate] = useState<Date | null>(new Date());

  const [period, setPeriod] = useState<string>('Matin');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const schoolId = localStorage.getItem('school_id');
    const academicYear = localStorage.getItem('active_annee_id');
    if (!schoolId || !date) return;
    
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];

      const [resT, resA] = await Promise.all([
        fetch(`/api/teachers?schoolId=${schoolId}`),
        fetch(`/api/teachers/attendance?schoolId=${schoolId}&date=${dateStr}&period=${period}`)
      ]);

      const teachersData = await resT.json();
      const attendData = await resA.json();

      const safeTeachers = Array.isArray(teachersData) ? teachersData : [];
      const safeAttend = Array.isArray(attendData) ? attendData : [];

      setTeachers(safeTeachers);
      
      // Initialisation des maps
      const newAttendMap: Record<string, string> = {};
      const newCommentMap: Record<string, string> = {};

      // Remplissage par défaut (Présent)
      safeTeachers.forEach((t: any) => {
        newAttendMap[t._id] = 'Présent';
        newCommentMap[t._id] = '';
      });

      // Écraser avec les données réelles de la DB
      safeAttend.forEach((a: any) => {
        newAttendMap[a.teacherId] = a.status;
        newCommentMap[a.teacherId] = a.comment || '';
      });
      
      setAttendanceMap(newAttendMap);
      setCommentMap(newCommentMap);
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Chargement échoué', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [date, period]);

  const handleSave = async () => {
    const schoolId = localStorage.getItem('school_id');
    const academicYear = localStorage.getItem('active_annee_id');
    
    if(!academicYear) {
        notifications.show({ title: 'Erreur', message: 'Année scolaire manquante', color: 'red' });
        return;
    }

    setLoading(true);
    const payload = {
      schoolId,
      academicYear,
      date: date?.toISOString().split('T')[0],
      period,
      attendanceData: Object.entries(attendanceMap).map(([id, status]) => ({
        teacherId: id,
        status,
        comment: commentMap[id] || ''
      }))
    };

    try {
      const res = await fetch('/api/teachers/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();
      notifications.show({ title: 'Succès', message: 'Pointage enregistré avec succès', color: 'teal' });
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Sauvegarde impossible', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  // Ajoute l'heure actuelle dans le commentaire (Pratique pour le retard)
  const quickTime = (id: string) => {
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setCommentMap(prev => ({ ...prev, [id]: `Arrivé à ${now}. ${prev[id] || ''}` }));
  };

  const exportToExcel = () => {
    const dataToExport = teachers.map(t => ({
      Enseignant: t.name,
      Telephone: t.phone,
      Statut: attendanceMap[t._id],
      Commentaire: commentMap[t._id],
      Date: date?.toLocaleDateString(),
      Periode: period
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Présences");
    XLSX.writeFile(workbook, `Presence_Profs_${date?.toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Rapport de Présence Enseignants - ${period}`, 14, 15);
    doc.text(`Date: ${date?.toLocaleDateString()}`, 14, 22);

    const tableRows = teachers.map(t => [
      t.name,
      attendanceMap[t._id],
      commentMap[t._id] || '-'
    ]);

    autoTable(doc, {
      head: [['Enseignant', 'Statut', 'Observations']],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [20, 158, 133] }
    });

    doc.save(`Presence_Profs_${date?.toISOString().split('T')[0]}.pdf`);
  };

  return (
  <Stack gap="lg">
    {/* HEADER : Adaptatif */}
    <Group justify="space-between" align="center" wrap="wrap">
      <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>Pointage des Enseignants</Title>
      
      <Flex gap="xs" direction="row" flex={{ base: 1, sm: 0 }}>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button 
              variant="light" 
              leftSection={<IconDownload size={18} />}
              style={{ flex: 1 }}
            >
              Exporter
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconFileSpreadsheet size={16} color="green" />} onClick={exportToExcel}>Excel (.xlsx)</Menu.Item>
            <Menu.Item leftSection={<IconFileTypePdf size={16} color="red" />} onClick={exportToPDF}>PDF (.pdf)</Menu.Item>
          </Menu.Dropdown>
        </Menu>
        
        <Button 
          leftSection={<IconDeviceFloppy size={18}/>} 
          onClick={handleSave} 
          color="teal"
          style={{ flex: 1 }}
        >
          Enregistrer
        </Button>
      </Flex>
    </Group>

    {/* FILTRES : Passage en colonnes sur mobile */}
    <Card withBorder radius="md" shadow="sm">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <DateInput 
          label="Date" 
          value={date}
          onChange={(val) => setDate(val as Date | null)}
          valueFormat="DD/MM/YYYY" 
          locale="fr" 
          w="100%"
        />

        <Select 
          label="Période" 
          value={period} 
          onChange={(v) => setPeriod(v || 'Matin')} 
          data={['Matin', 'Après-midi', 'Journée']} 
          w="100%"
        />
        <Button 
          variant="outline" 
          onClick={loadData} 
          leftSection={<IconRefresh size={16}/>}
          mt={{ base: 0, sm: 24 }} // Aligne le bouton avec les inputs sur desktop
        >
          Actualiser
        </Button>
      </SimpleGrid>
    </Card>

    {/* TABLEAU : ScrollArea pour protéger la vue mobile */}
    <Paper withBorder radius="md" pos="relative" shadow="xs" style={{ overflow: 'hidden' }}>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} />
      
      <ScrollArea scrollbarSize={8}>
        <Table 
          verticalSpacing="sm" 
          highlightOnHover 
          style={{ minWidth: rem(750) }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: rem(200) }}>Enseignant</Table.Th>
              <Table.Th style={{ width: rem(300) }}>Statut</Table.Th>
              <Table.Th>Observations / Heure</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {teachers.map((t: any) => (
              <Table.Tr key={t._id}>
                <Table.Td>
                  <Stack gap={0}>
                    <Text fw={600} fz="sm">{t.name}</Text>
                    <Text fz="xs" c="dimmed">{t.phone}</Text>
                  </Stack>
                </Table.Td>
                
                <Table.Td>
                  <Radio.Group 
                    value={attendanceMap[t._id]} 
                    onChange={(val) => setAttendanceMap(prev => ({ ...prev, [t._id]: val }))}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <Radio value="Présent" label="P" color="green" size="sm" title="Présent" />
                      <Radio value="Absent" label="A" color="red" size="sm" title="Absent" />
                      <Radio value="En retard" label="R" color="orange" size="sm" title="Retard" />
                      <Radio value="Congé" label="C" color="blue" size="sm" title="Congé" />
                    </Group>
                  </Radio.Group>
                </Table.Td>
                
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <TextInput
                      size="xs"
                      placeholder="Note..."
                      style={{ flex: 1 }}
                      value={commentMap[t._id]}
                      onChange={(e) => setCommentMap(prev => ({ ...prev, [t._id]: e.target.value }))}
                      leftSection={<IconMessage2 size={14} />}
                    />
                    <ActionIcon 
                      variant="light" 
                      color="blue" 
                      onClick={() => quickTime(t._id)} 
                      size="md"
                    >
                      <IconClock size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  </Stack>
);
}