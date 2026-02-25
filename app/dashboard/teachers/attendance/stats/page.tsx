'use client';

import { useState, useEffect } from 'react';
import { 
  Paper, Title, Group, Select, Container, Stack, Grid, 
  RingProgress, Text, Loader, Center 
} from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TeacherStatsPage() {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth().toString()); // Mois actuel par défaut
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    const schoolId = localStorage.getItem('school_id');
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/attendance/stats?schoolId=${schoolId}&month=${month}`);
      const stats = await res.json();
      setData(stats);
    } catch (error) {
      console.error("Erreur stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [month]);

  const totals = data.reduce((acc, curr: any) => ({
    presences: acc.presences + (curr.Présent || 0),
    total: acc.total + (curr.Présent || 0) + (curr.Absent || 0) + (curr['En retard'] || 0)
  }), { presences: 0, total: 0 });

  const rate = totals.total > 0 ? Math.round((totals.presences / totals.total) * 100) : 0;

  return (
    <Container size="xl" p="md">
      <Stack gap="xl">
        <Group justify="space-between">
          <Stack gap={0}>
            <Title order={2}>Analyse Mensuelle des Présences</Title>
            <Text c="dimmed" fz="sm">Statistiques détaillées par enseignant</Text>
          </Stack>
          
          <Select 
            label="Choisir un mois"
            value={month}
            onChange={(v) => setMonth(v || '0')}
            data={[
              { value: '0', label: 'Janvier' }, { value: '1', label: 'Février' },
              { value: '2', label: 'Mars' }, { value: '3', label: 'Avril' },
              { value: '4', label: 'Mai' }, { value: '5', label: 'Juin' },
              { value: '6', label: 'Juillet' }, { value: '7', label: 'Août' },
              { value: '8', label: 'Septembre' }, { value: '9', label: 'Octobre' },
              { value: '10', label: 'Novembre' }, { value: '11', label: 'Décembre' },
            ]}
          />
        </Group>

        {loading ? (
          <Center h={300}><Loader color="teal" /></Center>
        ) : (
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper withBorder p="xl" radius="md" h="100%" shadow="sm">
                <Stack align="center" justify="center" h="100%">
                  <RingProgress
                    size={180}
                    thickness={18}
                    roundCaps
                    sections={[{ value: rate, color: 'teal' }]}
                    label={<Text ta="center" fw={800} size="xl">{rate}%</Text>}
                  />
                  <Text fw={600} fz="lg">Taux de présence</Text>
                  <Text fz="xs" c="dimmed" ta="center">Basé sur le total des pointages du mois</Text>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper withBorder p="xl" radius="md" shadow="sm">
                <Title order={4} mb="lg">Répartition par Enseignant</Title>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)', radius: [4, 4, 0, 0] }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend iconType="circle" />
                      <Bar name="Présent" dataKey="Présent" fill="#209E85" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar name="Absent" dataKey="Absent" fill="#E03131" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar name="En retard" dataKey="En retard" fill="#F08C00" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid.Col>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}

