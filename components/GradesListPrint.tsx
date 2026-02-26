import { forwardRef } from 'react';
import { Table, Title, Text, Box, Grid, Divider, Stack } from '@mantine/core';

interface GradesListPrintProps {
  students: any[];
  grades: Record<string, { value: number | string; comment: string }>;
  classLabel: string;
  subjectLabel: string;
  period: string;
  schoolInfo: any;
  academicYearLabel: string;
}

export const GradesListPrint = forwardRef<HTMLDivElement, GradesListPrintProps>(
  ({ students, grades, classLabel, subjectLabel, period, schoolInfo, academicYearLabel }, ref) => {
    if (!students || students.length === 0) return null;

    return (
      <Box 
        ref={ref} 
        p={40} 
        style={{ 
          backgroundColor: 'white', 
          color: 'black', 
          minHeight: '29.7cm',
          position: 'relative' 
        }}
      >
        <Grid mb={30} align="center">
          <Grid.Col span={2}>
            {schoolInfo?.logo ? (
              <img 
                src={schoolInfo.logo} 
                alt="Logo" 
                style={{ width: '100px', height: '100px', objectFit: 'contain' }} 
              />
            ) : (
              <Box style={{ width: '80px', height: '80px', border: '1px solid #eee' }} />
            )}
          </Grid.Col>
          
          <Grid.Col span={5}>
            <Stack gap={0}>
              <Title order={4} style={{ textTransform: 'uppercase' }}>
                {schoolInfo?.name || "ÉCOLE NATIONALE"}
              </Title>
              {schoolInfo?.address && (<Text fz="xs">{schoolInfo?.address}</Text>)}
              <Text fz="xs"><b>Tél :</b> {schoolInfo?.phone}</Text>
              <Text fz="xs"><b>Email :</b> {schoolInfo?.email || '---'}</Text>
              {schoolInfo?.nif && (<Text fz="xs">NIF: {schoolInfo?.nif}</Text>)}
              {schoolInfo?.stat && (<Text fz="xs">STAT: {schoolInfo?.stat}</Text>)}
            </Stack>
          </Grid.Col>
          
          <Grid.Col span={5} ta="right">
            <Title order={5} c="dimmed">REPOBLIKAN'I MADAGASIKARA</Title>
            <Text fz="xs" >Fitiavana - Tanindrazana - Fandrosoana</Text>
            <Divider my={5} />
            <Title order={4}>FEUILLE DE NOTES</Title>
            <Text fw={700} fz="md">{period}</Text>
            <Text fz="xs">Année Scolaire : {academicYearLabel}</Text>
          </Grid.Col>
        </Grid>

        <Divider mb="xl" color="dark" size="sm" />

        <Grid mb={20}>
          <Grid.Col span={6}>
            <Text fz="sm"><b>CLASSE :</b> {classLabel}</Text>
            <Text fz="sm"><b>MATIÈRE :</b> {subjectLabel}</Text>
          </Grid.Col>
          <Grid.Col span={6} ta="right">
            <Text fz="sm"><b>EFFECTIF :</b> {students.length} élèves</Text>
            <Text fz="sm"><b>DATE :</b> {new Date().toLocaleDateString('fr-FR')}</Text>
          </Grid.Col>
        </Grid>

        <Table withTableBorder withColumnBorders verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
              <Table.Th ta="center">N°</Table.Th>
              <Table.Th>Nom et Prénoms de l'Élève</Table.Th>
              <Table.Th ta="center">Note / 20</Table.Th>
              <Table.Th >Observations / Commentaires</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {students.map((student, index) => (
              <Table.Tr key={student._id}>
                <Table.Td ta="center">{student?.matricule || index + 1}</Table.Td>
                <Table.Td fw={500}>{student.name?.toUpperCase()}</Table.Td>
                <Table.Td ta="center" fw={700} fz="lg">
                  {grades[student._id]?.value || '---'}
                </Table.Td>
                <Table.Td fz="xs">
                  {grades[student._id]?.comment || ''}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Grid mt={50}>
          <Grid.Col span={6} ta="center">
            <Text fz="sm" fw={700} >Le Professeur</Text>
          </Grid.Col>
          <Grid.Col span={6} ta="center">
            <Text fz="sm" fw={700} >Le Directeur</Text>
          </Grid.Col>
        </Grid>

        <Box style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
          <Divider mb="xs" />
          <Text fz="xs" ta="center" c="dimmed">
            Document généré le {new Date().toLocaleDateString('fr-FR')} - {schoolInfo?.city || 'Madagascar'}
          </Text>
        </Box>
      </Box>
    );
  }
);

GradesListPrint.displayName = 'GradesListPrint';