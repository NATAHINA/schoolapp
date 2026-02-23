'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Table, Group, Text, Button, Title, Stack, Badge, 
  ActionIcon, Paper, Select, LoadingOverlay, Center, SimpleGrid,
  Box, ScrollArea, Divider, Flex
} from '@mantine/core';
import { 
  IconTrash, IconPrinter, IconCalculator, IconAlertTriangle, 
  IconFileText, IconRefresh 
} from '@tabler/icons-react';
import { useReactToPrint } from 'react-to-print';
import { notifications } from '@mantine/notifications';
import { ReportCard } from '@/components/ReportCard';
import { ResultListPrint } from '@/components/ResultListPrint';

export default function ReportsPage() {
  
  const [reports, setReports] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const listPrintRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const BIMESTRES = ['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4', 'Bimestre 5', 'Bimestre 6'];

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Bulletin_${selectedReport?.student?.name || 'Eleve'}`,
  });

  const handlePrintList = useReactToPrint({
    contentRef: listPrintRef,
    documentTitle: `Resultats_${period}_${selectedClass}`,
  });

  useEffect(() => {
    const fetchClasses = async () => {
      const schoolId = localStorage.getItem('school_id');
      const res = await fetch(`/api/settings/classes?schoolId=${schoolId}`);
      const data = await res.json();
      setClasses(data.map((c: any) => ({ value: c._id, label: c.name })));
    };
    fetchClasses();
  }, []);

  const fetchReports = async () => {
    if (!selectedClass || !period) return;
    setLoading(true);
    try {
      const schoolId = localStorage.getItem('school_id');
      const academicYear = localStorage.getItem('active_annee_id');
      const url = `/api/reports?classId=${selectedClass}&period=${encodeURIComponent(period)}&schoolId=${schoolId}&academicYear=${academicYear}`;
      const res = await fetch(url);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error: any) {
      notifications.show({ title: 'Erreur', message: 'Impossible de charger les rapports', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [selectedClass, period]);

  const generateReports = async () => {
    if (!selectedClass || !period) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reports/generate', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          classId: selectedClass, 
          period, 
          schoolId: localStorage.getItem('school_id'),
          academicYear: localStorage.getItem('active_annee_id')
        }) 
      });
      if (res.ok) {
        notifications.show({ title: 'Succès', message: 'Calculs terminés !', color: 'teal' });
        fetchReports();
      }
    } finally { setLoading(false); }
  };

  const preparePrint = (report: any) => {
    setSelectedReport(report);
    setTimeout(() => handlePrint(), 300);
  };

  const deleteReport = async (id: string) => {
    if (confirm("Supprimer ce bulletin ?")) {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      fetchReports();
    }
  };

  const stats = {
    total: reports.length,
    passed: reports.filter((r: any) => r.average >= 10).length,
    failed: reports.filter((r: any) => r.average < 10).length,
    maxAvg: reports.length > 0 ? Math.max(...reports.map((r: any) => r.average)) : 0,
    minAvg: reports.length > 0 ? Math.min(...reports.map((r: any) => r.average)) : 0,
  };
  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;

  return (
    <Stack gap="lg">
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />
      
      {/* HEADER RÉACTIF */}
      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Group gap="xs">
            <IconFileText size={28} color="var(--mantine-color-blue-6)" />
            <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>Gestion des Bulletins</Title>
          </Group>
          <Text fz="sm" c="dimmed" visibleFrom="sm">Générez les rangs et imprimez les rapports périodiques</Text>
        </Stack>
        
        <Flex 
            gap="xs" 
            direction={{ base: 'column', sm: 'row' }}
            style={{ width: '100%' }}
          >
          <Button 
            leftSection={<IconPrinter size={18} />} 
            variant="outline"
            onClick={() => handlePrintList()}
            disabled={reports.length === 0}
          >
            Imprimer toute la classe ({reports.length})
          </Button>
          <Button 
            leftSection={<IconCalculator size={18} />} 
            onClick={generateReports}
            disabled={!selectedClass || !period}
          >
            {reports.length > 0 ? 'Recalculer' : 'Générer'}
          </Button>
        </Flex>
      </Group>

      {/* FILTRES */}
      <Paper withBorder p="md" radius="md" shadow="xs">
        <SimpleGrid cols={{ base: 1, sm: 3 }} style={{ alignItems: 'flex-end' }}>
          <Select 
            label="Classe" 
            placeholder="Choisir une classe" 
            data={classes} 
            value={selectedClass} 
            onChange={setSelectedClass}
            searchable
          />
          <Select 
            label="Période" 
            placeholder="Choisir une période" 
            data={BIMESTRES} 
            value={period} 
            onChange={setPeriod}
          />
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
            onClick={fetchReports}
            disabled={!selectedClass}
          >
            Actualiser
          </Button>
        </SimpleGrid>
      </Paper>

      {/* STATS RAPIDES */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        {[
          { label: 'Réussite', value: `${successRate}%`, color: 'teal', sub: `${stats.passed} admis` },
          { label: 'Échecs', value: stats.failed, color: 'red', sub: 'Moyenne < 10' },
          { label: 'Moy. Max', value: stats.maxAvg.toFixed(2), color: 'indigo', sub: 'Majorant' },
          { label: 'Moy. Min', value: stats.minAvg.toFixed(2), color: 'orange', sub: 'Minorant' },
        ].map((s, i) => (
          <Paper key={i} withBorder p="md" radius="md" bg="gray.0">
            <Text fz="xs" c="dimmed" fw={700} tt="uppercase">{s.label}</Text>
            <Text fz="xl" fw={900} c={s.color}>{s.value}</Text>
            <Text fz="calc(10px)" c="dimmed">{s.sub}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* TABLEAU DES RAPPORTS */}
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <ScrollArea h={500}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover style={{ minWidth: 700 }}>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th style={{ width: 80 }}>Rang</Table.Th>
                <Table.Th>Élève</Table.Th>
                <Table.Th>Moyenne Générale</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.length > 0 ? reports.map((r: any) => (
                <Table.Tr key={r._id}>
                  <Table.Td>
                    <Badge 
                      size="lg" 
                      variant="gradient" 
                      gradient={r.rank === 1 ? { from: 'yellow', to: 'orange' } : { from: 'blue', to: 'cyan' }}
                    >
                      {r.rank}{r.rank === 1 ? 'er' : 'e'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={600} size="sm">{r.student?.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text fw={800} fz="md" c={r.average >= 10 ? 'teal.8' : 'red.8'}>
                        {r.average.toFixed(2)}
                      </Text>
                      <Divider orientation="vertical" />
                      <Badge variant="dot" color={r.average >= 10 ? 'teal' : 'red'}>
                        {r.average >= 10 ? 'Admis' : 'Échec'}
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Button 
                        size="compact-sm" 
                        variant="light" 
                        color="green" 
                        leftSection={<IconPrinter size={14} />}
                        onClick={() => preparePrint(r)}
                      >
                        Imprimer
                      </Button>
                      <ActionIcon variant="subtle" color="red" onClick={() => deleteReport(r._id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Center py={50}>
                      <Stack align="center" gap="xs">
                        <IconAlertTriangle size={40} color="var(--mantine-color-orange-5)" />
                        <Text fw={500} c="dimmed">Aucun bulletin disponible.</Text>
                        <Text size="xs" c="dimmed">Sélectionnez une classe et cliquez sur "Générer".</Text>
                      </Stack>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* COMPOSANTS D'IMPRESSION CACHÉS */}
      <Box style={{ display: 'none' }}>
        <ReportCard ref={componentRef} data={selectedReport} />
        <ResultListPrint ref={listPrintRef} reports={reports} period={period || ''} />
      </Box>
    </Stack>
  );
}

