'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  Container, Table, Text, Badge, Group, Paper, Title, Loader, 
  Center, Stack, SegmentedControl, SimpleGrid, Button, Image, Box, Divider
} from '@mantine/core';
import { IconPrinter, IconUsers, IconCalendar, IconMail, IconPhone, IconChartBar } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PrintableReport } from '@/components/PrintableReport';

// --- PAGE PRINCIPALE ---
export default function AttendanceStatsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const schoolId = localStorage.getItem('school_id');
      const anneeId = localStorage.getItem('active_annee_id');
      try {
        const [statsRes, schoolRes] = await Promise.all([
          fetch(`/api/attendance/stats?schoolId=${schoolId}&academicYear=${anneeId}&range=${range}`),
          fetch(`/api/settings/general?schoolId=${schoolId}`)
        ]);
        const statsD = await statsRes.json();
        const schoolD = await schoolRes.json();
        setData(Array.isArray(statsD) ? statsD : []);
        setSchoolData(schoolD);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [range]);

  const chartData = useMemo(() => {
    const counts: any = {};
    data.forEach(item => { counts[item.className] = (counts[item.className] || 0) + 1; });
    return Object.entries(counts).map(([name, total]) => ({ name, total: total as number }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  if (loading) return <Center h="80vh"><Loader color="teal" /></Center>;

  return (
    <Container size="xl" py="md">
      <Stack gap="xl" className="screen-only">
        <Group justify="space-between">
          <Title order={2} fw={900}>Statistiques d'Assiduité</Title>
          <Group>
            <Button color="dark" leftSection={<IconPrinter size={18} />} onClick={() => window.print()}>
              Imprimer le Rapport PDF
            </Button>
            <SegmentedControl value={range} onChange={setRange} data={[
                { label: 'Tout', value: 'all' },
                { label: '7 jours', value: 'week' },
                { label: '30 jours', value: 'month' },
              ]} color="teal" />
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper withBorder p="md" radius="md" style={{ borderLeft: '4px solid #364FC7' }}>
            <Text fz="xs" c="dimmed" fw={700}>TOTAL ABSENCES</Text>
            <Text fz="xl" fw={900}>{data.length}</Text>
          </Paper>
          <Paper withBorder p="md" radius="md" style={{ borderLeft: '4px solid #12b886' }}>
            <Text fz="xs" c="dimmed" fw={700}>JUSTIFIÉES</Text>
            <Text fz="xl" fw={900} c="teal">{data.filter(d => d.isJustified).length}</Text>
          </Paper>
          <Paper withBorder p="md" radius="md" style={{ borderLeft: '4px solid #fa5252' }}>
            <Text fz="xs" c="dimmed" fw={700}>TAUX DE RÉGULARITÉ</Text>
            <Text fz="xl" fw={900}>{((data.filter(d => d.isJustified).length / data.length) * 100 || 0).toFixed(1)}%</Text>
          </Paper>
        </SimpleGrid>

        <Paper withBorder radius="md" p="md">
          <Text fw={700} mb="md">Top classes (Absences)</Text>
          <Box h={200}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)'}} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? '#fa5252' : '#228be6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Table verticalSpacing="sm" striped highlightOnHover>
            <Table.Thead><Table.Tr>
              <Table.Th>Date & Classe</Table.Th><Table.Th>Élève</Table.Th>
              <Table.Th>Matière</Table.Th><Table.Th>Statut</Table.Th>
            </Table.Tr></Table.Thead>
            <Table.Tbody>
              {data.map((rec, i) => (
                <Table.Tr key={i}>
                  <Table.Td><Text size="sm" fw={600}>{new Date(rec.date).toLocaleDateString()}</Text><Badge size="xs">{rec.className}</Badge></Table.Td>
                  <Table.Td fw={700}>{rec.studentName}</Table.Td>
                  <Table.Td><Text size="sm">{rec.subjectName}</Text><Text size="xs" c="dimmed">{rec.teacherName}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={rec.isJustified ? 'teal' : 'red'} variant="dot">{rec.isJustified ? 'Justifié' : 'Injustifié'}</Badge>
                    {rec.justificationReason && <Text size="xs" c="dimmed" fs="italic">"{rec.justificationReason}"</Text>}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      <div className="print-content">
        <PrintableReport 
          schoolData={schoolData} 
          data={data} 
          range={range} 
        />
      </div>

      <style jsx global>{`
        .print-content { display: none; }
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { size: A4; margin: 15mm; }
          .screen-only { display: none !important; }
        }
      `}</style>
    </Container>
  );
}