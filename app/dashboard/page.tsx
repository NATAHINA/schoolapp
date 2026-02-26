

'use client';

import { useEffect, useState } from 'react';
import { 
  SimpleGrid, Card, Text, Group, Title, Skeleton, Paper, Alert, Stack, 
  ThemeIcon, RingProgress, Divider, Badge, UnstyledButton  
} from '@mantine/core';

import { 
  IconUsers, IconSchool, IconUserOff, IconAlertCircle, 
  IconCash, IconCalendarStats, IconTrendingUp 
} from '@tabler/icons-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicYearName, setAcademicYearName] = useState('');

  useEffect(() => {
    const schoolId = localStorage.getItem('school_id');
    const activeAnneeId = localStorage.getItem('active_annee_id');

    if (schoolId && activeAnneeId) {
      fetchStats();
      const interval = setInterval(fetchStats, 300000);
      return () => clearInterval(interval);
    } else {
      const timeout = setTimeout(() => {
        if (localStorage.getItem('school_id')) fetchStats();
        else setLoading(false); 
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const fetchStats = async () => {
      try {

        setLoading(true);
        setError(null);

        const schoolId = localStorage.getItem('school_id');
        const activeAnneeId = localStorage.getItem('active_annee_id');
        
        if (!schoolId || !activeAnneeId) {
          setLoading(false);
          return;
        }

        // const res = await fetch(`/api/stats?schoolId=${schoolId}&academicYear=${activeAnneeId}`);

        const [resStats, resAnnee] = await Promise.all([
          fetch(`/api/stats?schoolId=${schoolId}&academicYear=${activeAnneeId}`),
          fetch(`/api/settings/annee/${activeAnneeId}`)
        ]);

        const statsJson = await resStats.json();
        const anneeJson = await resAnnee.json();

        setData(statsJson);
        setAcademicYearName(anneeJson.name);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    

  if (loading) return (
    <Stack p="md">
      <Skeleton height={40} width={200} mb="xl" />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }} mt="xl">
        <Skeleton height={350} radius="md" />
        <Skeleton height={350} radius="md" />
      </SimpleGrid>
    </Stack>
  );

  if (!loading && !data && !error) {
    return (
      <Alert icon={<IconAlertCircle size="1.1rem" />} color="blue" m="md">
        Initialisation de la session en cours... Si cela persiste, veuillez sélectionner une année scolaire.
      </Alert>
    );
  }

  if (error) return (
    <Alert icon={<IconAlertCircle size="1.1rem" />} title="Erreur" color="red" variant="filled" m="md">
      Impossible de charger les statistiques : {error}
    </Alert>
  );

  return (
    <Stack p="md" gap="xl">
      <Group justify="space-between">
        <Stack gap={2}>
          <Title order={2} fw={800}>Tableau de Bord</Title>
          <Text fz="sm" c="dimmed">Aperçu global de l'établissement pour l'année en cours</Text>
        </Stack>
        <Badge size="xl" variant="dot" color="teal">Session {academicYearName || '...'}</Badge>
      </Group>

      {/* --- CARTES DE STATISTIQUES PRINCIPALES --- */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        <StatCard 
          title="Élèves Inscrits" 
          value={data.totalStudents} 
          icon={<IconUsers size={24} />} 
          color="blue" 
          description="Total des effectifs"
          link="/dashboard/students"
        />
        <StatCard 
          title="Recettes" 
          value={`${data.totalRevenue?.toLocaleString()} Ar`} 
          icon={<IconCash size={24} />} 
          color="teal" 
          description="Encaissements totaux"
          link="/dashboard/payments"
        />
        <StatCard 
          title="Absences" 
          value={data.absencesToday} 
          icon={<IconCalendarStats size={24} />} 
          color="red" 
          description="Enregistrées ce jour"
          link="/dashboard/attendance"
        />
        <StatCard 
          title="Classes" 
          value={data.totalClasses} 
          icon={<IconSchool size={24} />} 
          color="violet" 
          description="Salles actives"
          link="/dashboard/settings/classes"
        />
      </SimpleGrid>

      {/* --- GRAPHIQUES --- */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        
        {/* Graphique 1 : Évolution Inscriptions */}
        <Paper withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="xl">
            <Title order={4}>Inscriptions (7 derniers jours)</Title>
            <IconTrendingUp size={20} color="gray" />
          </Group>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="students" stroke="#228be6" strokeWidth={3} dot={{ r: 4, fill: '#228be6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        {/* Graphique 2 : Revenus par Mois */}
        <Paper withBorder p="lg" radius="md" shadow="sm">
          <Title order={4} mb="xl">Revenus Mensuels (Ar)</Title>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />

                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => `${val?.toLocaleString() ?? 0} Ar`} 
                />

                <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={30}>
                  {data.revenueData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === data.revenueData.length - 1 ? '#12b886' : '#94d82d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Paper>
      </SimpleGrid>

      {/* --- SECTION BASSE : RÉPARTITION ET ALERTES --- */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
        <Paper withBorder p="lg" radius="md" shadow="sm" style={{ gridColumn: 'span 1' }}>
          <Title order={5} mb="md">Taux de Recouvrement</Title>
          <Group justify="center">
            <RingProgress
              size={160}
              thickness={16}
              roundCaps
              sections={[{ value: data.collectionRate || 0, color: 'teal' }]}
              label={
                <Text fw={700} ta="center" fz="xl">
                  {data.collectionRate}%
                </Text>
              }
            />
          </Group>
          <Text fz="xs" ta="center" c="dimmed" mt="sm">
            Écolages payés vs attendus pour le mois en cours
          </Text>
        </Paper>

        <Paper withBorder p="lg" radius="md" shadow="sm" style={{ gridColumn: 'span 2' }}>
          <Title order={5} mb="md">Dernières Activités</Title>
          <Stack gap="xs">
            {data.recentActivities?.map((act: any, i: number) => (
              <Group key={i} justify="space-between" wrap="nowrap">
                <Group gap="sm">
                  <ThemeIcon variant="light" color={act.type === 'Paiement' ? 'teal' : 'blue'} size="sm">
                    {act.type === 'Paiement' ? <IconCash size={14} /> : <IconUsers size={14} />}
                  </ThemeIcon>
                  <Text fz="sm" fw={500}>{act.description}</Text>
                </Group>
                <Text fz="xs" c="dimmed">{act.time}</Text>
              </Group>
            ))}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}

// --- SOUS-COMPOSANT POUR LES CARTES ---
// function StatCard({ title, value, icon, color, description }: any) {
//   return (
//     <Card withBorder radius="md" p="lg" shadow="sm">
//       <Group justify="space-between" align="flex-start">
//         <Stack gap={0}>
//           <Text fz="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
//           <Text fz="xl" fw={800}>{value}</Text>
//           <Text fz="xs" c="dimmed" mt={4}>{description}</Text>
//         </Stack>
//         <ThemeIcon variant="light" color={color} size="xl" radius="md">
//           {icon}
//         </ThemeIcon>
//       </Group>
//     </Card>
//   );
// }


function StatCard({ title, value, icon, color, description, link }: any) {
  return (
    <UnstyledButton 
      component={Link} 
      href={link} 
      style={{ display: 'block' }}
    >
      <Card 
        withBorder 
        radius="md" 
        p="lg" 
        shadow="sm"
        style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <Text fz="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
            <Text fz="xl" fw={800}>{value}</Text>
            <Text fz="xs" c="dimmed" mt={4}>{description}</Text>
          </Stack>
          <ThemeIcon variant="light" color={color} size="xl" radius="md">
            {icon}
          </ThemeIcon>
        </Group>
      </Card>
    </UnstyledButton>
  );
}