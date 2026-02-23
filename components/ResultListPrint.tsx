import { forwardRef } from 'react';
import { Table, Title, Text, Box, Grid, Divider, Stack } from '@mantine/core';

interface ResultListPrintProps {
  reports: any[];
  className?: string;
  period: string;
}

export const ResultListPrint = forwardRef<HTMLDivElement, ResultListPrintProps>(({ reports, className, period }, ref) => {
  if (!reports || reports.length === 0) return null;
  
  const school = reports[0].schoolId;
  const annes = reports[0].academicYear;
  const className_ = reports[0].class?.name;

  return (
    <Box ref={ref} p={40} className={className} style={{ backgroundColor: 'white', color: 'black', minHeight: '29.7cm' }}>
      
      <Grid mb={30} align="center">
        <Grid.Col span={2}>
          {school?.logo ? (
            <img 
              src={school.logo} 
              onError={(e) => (e.currentTarget.style.display = 'none')}
              alt="Logo école" 
              style={{ width: '120px', height: '120px', objectFit: 'contain' }} 
            />
          ) : (
            <Box style={{ width: '80px', height: '80px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text fz="xs" c="dimmed">Pas de logo</Text>
            </Box>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          <Stack gap={0}>
            <Title order={4} style={{ textTransform: 'uppercase' }}>
              {school?.name || "ÉCOLE NATIONALE"}
            </Title>
            {school?.address && <Text fz="sm">{school?.address}</Text>}
            {school?.phone && <Text fz="sm"><b>Tél :</b> {school?.phone}</Text>}
            {school?.email && <Text fz="sm"><b>Email :</b> {school?.email}</Text>}
            {school?.nif && <Text fz="sm"><b>NIF :</b> {school?.nif}</Text>}
            {school?.stat && <Text fz="sm"><b>STAT :</b> {school?.stat}</Text>}
          </Stack>
        </Grid.Col>
        
        <Grid.Col span={6} ta="right">
          <Title order={4} c="dimmed">REPOBLIKAN'I MADAGASIKARA</Title>
          <Text fz="xs">Fitiavana - Tanindrazana - Fandrosoana</Text>
          <Divider my={5} />
          <Title order={4}>LISTE DES RÉSULTATS</Title>
          <Text fw={700} fz="lg">{period}</Text>
          <Text fz="sm">Année Scolaire : {annes?.name || "2025-2026"}</Text>
        </Grid.Col>
      </Grid>

      <Divider mb="xl" color="dark" size="md" />

      {/* Info Classe */}
      <Box mb={20}>
        <Text fz="sm"><b>CLASSE :</b> {className_}</Text>
        <Text fz="sm"><b>EFFECTIF :</b> {reports.length} élèves</Text>
      </Box>

      <Table withTableBorder withColumnBorders verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
            <Table.Th ta="center" w={60}>Rang</Table.Th>
            <Table.Th>Nom et Prénoms</Table.Th>
            <Table.Th ta="center" w={100}>Moyenne</Table.Th>
            <Table.Th ta="center" w={120}>Résultat</Table.Th>
            <Table.Th ta="center" w={150}>Émargement</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reports.map((r) => (
            <Table.Tr key={r._id}>
              <Table.Td ta="center" fw={700}>
                {r.rank}{r.rank === 1 ? 'er' : 'e'}
              </Table.Td>
              <Table.Td fw={500}>{r.student?.name?.toUpperCase()}</Table.Td>
              <Table.Td ta="center" fw={700}>{r.average.toFixed(2)}</Table.Td>
              <Table.Td ta="center">
                <Text fz="xs" fw={700} c={r.average >= 10 ? 'teal.9' : 'red.9'}>
                  {r.average >= 10 ? 'ADMIS' : 'ÉCHEC'}
                </Text>
              </Table.Td>
              <Table.Td></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      
      <Grid mt={50} ta="center">
        <Grid.Col span={6}>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text fz="sm" fw={700} td="underline">Le Directeur</Text>
          
        </Grid.Col>
      </Grid>

      <Box style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
        <Divider mb="xs" />
        <Text fz="xs" ta="center" c="dimmed">
          Fait à {school?.city || school?.address || 'Madagasikara'}, le {new Date().toLocaleDateString('fr-FR')}
        </Text>
      </Box>
    </Box>
  );
});

ResultListPrint.displayName = 'ResultListPrint';