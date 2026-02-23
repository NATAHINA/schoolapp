import { Box, Table, Text, Title, Group, Stack, Divider, Grid, Badge  } from '@mantine/core';
import { forwardRef } from 'react';

interface ReportCardProps {
  data: any; 
}


export const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(({ data }, ref) => {
  if (!data) return null;

  // Fonction pour l'appréciation automatique
  const getGeneralComment = (avg: number) => {
    if (avg >= 16) return "Excellent travail, félicitations !";
    if (avg >= 14) return "Très bon. Continuez ainsi.";
    if (avg >= 12) return "Satisfaisant. Peut encore mieux faire.";
    if (avg >= 10) return "Passable. Travail régulier à poursuivre.";
    return "Insuffisant. Doit redoubler d'efforts.";
  };

  return (
    <Box ref={ref} p={40} style={{ backgroundColor: 'white', color: 'black', minHeight: '29.7cm', position: 'relative' }}>
      {/* En-tête Dynamique */}
      <Grid mb={30} align="center">
        <Grid.Col span={2}>
          {data.schoolId?.logo ? (
            <img 
              src={data.schoolId.logo} 
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
              {data.schoolId?.name || "ÉCOLE NATIONALE"}
            </Title>
            {data.schoolId?.address && <Text fz="sm">{data.schoolId?.address}</Text>}
            {data.schoolId?.phone && <Text fz="sm"><b>Tél :</b> {data.schoolId?.phone}</Text>}
            {data.schoolId?.email && <Text fz="sm"><b>Email :</b> {data.schoolId?.email}</Text>}
            {data.schoolId?.nif && <Text fz="sm"><b>NIF :</b> {data.schoolId?.nif}</Text>}
            {data.schoolId?.stat && <Text fz="sm"><b>STAT :</b> {data.schoolId?.stat}</Text>}
          </Stack>
        </Grid.Col>
        
        <Grid.Col span={6} ta="right">
          <Title order={4} c="dimmed">REPOBLIKAN'I MADAGASIKARA</Title>
          <Text fz="xs" fs="italic">Fitiavana - Tanindrazana - Fandrosoana</Text>
          <Divider my={5} />
          <Title order={4}>BULLETIN DE NOTES</Title>
          <Text fw={700} fz="lg" c="blue">{data.period}</Text>
          <Text fz="sm">Année Scolaire: {data.academicYear?.name || "2025-2026"}</Text>
        </Grid.Col>
      </Grid>

      <Divider mb="xl" color="dark" size="md" />

      {/* Infos Élève */}
      <Box mb={30} p="md" style={{ border: '1px solid #dee2e6', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
        <Grid>
          <Grid.Col span={6}>
            <Text><b>ÉLÈVE :</b> {data.student?.name?.toUpperCase()}</Text>
            <Text><b>SEXE :</b> {data.student?.gender === 'M' ? 'Masculin' : 'Féminin'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text><b>CLASSE :</b> {data.class?.name}</Text>
            <Text><b>EFFECTIF :</b> {data.classSize || '-'} élèves</Text>
          </Grid.Col>
        </Grid>
      </Box>

      {/* Tableau des notes */}
      <Table withTableBorder withColumnBorders verticalSpacing="xs" mb={30}>
        <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
          <Table.Tr>
            <Table.Th>Matières</Table.Th>
            <Table.Th ta="center">Note / 20</Table.Th>
            <Table.Th ta="center">Coeff</Table.Th>
            <Table.Th ta="center">Points</Table.Th>
            <Table.Th>Appréciations des professeurs</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.subjectsDetails?.map((item: any, index: number) => (
            <Table.Tr key={index}>
              <Table.Td fw={700}>{item.subjectName || item.subject?.name}</Table.Td>
              <Table.Td ta="center" fw={600}>{item.grade?.toFixed(2)}</Table.Td>
              <Table.Td ta="center">{item.coeff}</Table.Td>
              <Table.Td ta="center">{(item.grade * item.coeff).toFixed(2)}</Table.Td>
              <Table.Td style={{ fontSize: '11px', fontStyle: 'italic' }}>
                {item.teacherComment || (item.grade >= 10 ? 'Assez bien' : 'À surveiller')}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Résumé et Appréciation Globale */}
      <Grid gutter="xl">
        <Grid.Col span={7}>
          <Box p="md" style={{ border: '1px solid black', borderRadius: '4px', height: '100%' }}>
            <Text fw={700} mb={5}>OBSERVATIONS GLOBALES :</Text>
            <Text fz="sm" mb={10}>
              {getGeneralComment(data.average)}
            </Text>
            <Divider variant="dotted" my={10} />
            <Text fz="xs"><b>Moyenne de la classe :</b> {data.classAverage?.toFixed(2)} / 20</Text>
          </Box>
        </Grid.Col>
        
        <Grid.Col span={5}>
          <Stack gap={5} p="md" style={{ backgroundColor: '#f1f3f5', borderRadius: '4px' }}>
            <Group justify="space-between">
              <Text fz="sm">Total Points :</Text>
              <Text fw={700}>{data.totalWeightedPoints?.toFixed(2)}</Text>
            </Group>
            <Group justify="space-between">
              <Text fz="md" fw={700}>MOYENNE :</Text>
              <Text fz="lg" fw={800} c="blue">{data.average?.toFixed(2)}</Text>
            </Group>
            <Group justify="space-between">
              <Text fz="sm">Rang :</Text>
              <Badge size="lg" radius="sm" color="dark">
                {data.rank} {data.rank === 1 ? 'er' : 'ème'}
              </Badge>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Signatures */}
      <Grid mt={50} ta="center">
        <Grid.Col span={6}>
          <Text fz="sm" fw={700} td="underline">Le Parent</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text fz="sm" fw={700} td="underline">Le Directeur</Text>
          <Box mt={60}>
            <Text fz="xs" c="dimmed">Signature & Cachet</Text>
          </Box>
        </Grid.Col>
      </Grid>

      {/* Pied de page fixe */}
      <Box style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
        <Divider mb="xs" />
        <Group justify="space-between">
          {data.schoolId?.website && <Text fz="xs" c="dimmed">Website: {data.schoolId?.website}</Text>}
          <Text fz="xs" c="dimmed">Fait à {data.schoolId?.city || data.schoolId?.address || 'Madagasikara'}, le {new Date().toLocaleDateString('fr-FR')}</Text>
        </Group>
      </Box>
    </Box>
  );
});

ReportCard.displayName = 'ReportCard';