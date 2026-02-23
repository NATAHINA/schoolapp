import { Box, Text, Title, Group, Stack, Divider, Grid, Table } from '@mantine/core';
import { forwardRef } from 'react';

interface AttendanceReportProps {
  session: any;
  schoolData: any;
}

export const AttendanceReport = forwardRef<HTMLDivElement, AttendanceReportProps>(({ session, schoolData }, ref) => {
  if (!session) return null;

  return (
    <Box 
      ref={ref} 
      p={40} 
      style={{ 
        backgroundColor: 'white', 
        color: 'black', 
        width: '21cm',
        minHeight: '29.7cm',
        margin: 'auto',
        position: 'relative'
      }}
    >

      <Grid mb={20} align="center">
        <Grid.Col span={2}>
          {schoolData?.logo ? (
            <img 
              src={schoolData.logo} 
              alt="Logo Ecole" 
              style={{ width: '110px', height: '110px', objectFit: 'contain' }} 
            />
          ) : (
            <Box style={{ width: '110px', height: '110px', border: '1px dashed #eee' }} />
          )}
        </Grid.Col>

        <Grid.Col span={6}>
          <Title order={3} style={{ lineHeight: 1.1 }}>
            {schoolData?.name?.toUpperCase() || "ÉTABLISSEMENT SCOLAIRE"}
          </Title>
          <Text fz="xs">DEPARTEMENT DE LA SCOLARITE</Text>
          <Box w={50} h={1} bg="dark" mt={5} />
        </Grid.Col>

        <Grid.Col span={4} ta="right">
          <Text fw={700} fz="sm">REPOBLIKAN'I MADAGASIKARA</Text>
          <Text fz="xs">Fitiavana - Tanindrazana - Fandrosoana</Text>
        </Grid.Col>
      </Grid>

      <Stack align="center" gap={0} my={30}>
        <Title order={3} style={{ textDecoration: 'underline', textUnderlineOffset: '8px' }}>
          BULLETIN OFFICIEL D'ABSENCE
        </Title>
        <Text mt={10}>
          N° REF : {session?.academicYear?.name 
          ? `${session.academicYear.name.toUpperCase()}/${session._id?.split('-')[1]?.substring(0, 4)}` 
          : session?._id?.substring(0, 8).toUpperCase()}
        </Text>
      </Stack>

      {/* Informations de base */}
      <Box style={{ border: '1px solid #000', padding: '15px' }} mb={30}>
        <Grid>
          <Grid.Col span={6}>
            <Text>CLASSE : {session.class}</Text>
          </Grid.Col>
          <Grid.Col span={6} ta="right">
            <Text>DATE : {new Date(session.date).toLocaleDateString('fr-FR', { dateStyle: 'long' }).toUpperCase()}</Text>
          </Grid.Col>
        </Grid>
      </Box>

      <Text mb="sm" fw={600}>LISTE DES ELEVES ABSENTS :</Text>

      <Table withTableBorder withColumnBorders verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: '#f0f0f0' }}>
            <Table.Th style={{ width: '60px', color: '#000' }}>N°</Table.Th>
            <Table.Th style={{ color: '#000' }}>NOM ET PRENOMS</Table.Th>
            <Table.Th style={{ width: '150px', color: '#000', textAlign: 'center' }}>OBSERVATION</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {session.students?.map((student: any, index: number) => (
            <Table.Tr key={index}>
              <Table.Td>{index + 1}</Table.Td>
              <Table.Td fw={700}>{student.name.toUpperCase()}</Table.Td>
              <Table.Td ta="center">ABSENT</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Box mt={20}>
        <Text>Arrêté la présente liste au nombre de <b>{session.students?.length}</b> élève(s) absent(s).</Text>
      </Box>

      <Group justify="flex-end" mt={100}>
        <Stack align="center" gap={0} style={{ minWidth: '250px' }}>
          <Text fz="sm">Fait à ......................., le .................</Text>
          <Text fz="sm" mt={10} style={{ textDecoration: 'underline' }}>Le Responsable de Scolarité</Text>
          <Box h={100} />
        </Stack>
      </Group>

      <Box style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
        <Divider color="dark" mb={5} />
        <Text fz={8} ta="center" c="dimmed">
          Généré via EduManager - Logiciel de Gestion Scolaire - {new Date().toLocaleString()}
        </Text>
      </Box>
    </Box>
  );
});

AttendanceReport.displayName = 'AttendanceReport';