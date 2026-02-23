// @/components/PrintableReport.tsx
import React from 'react';
import { Box, Group, Stack, Image, Title, Text, Table, Divider, Badge } from '@mantine/core';

interface PrintableReportProps {
  schoolData: any;
  data: any[];
  range: string;
}

// Ajoutez "export" ici pour pouvoir l'importer ailleurs
export const PrintableReport = ({ schoolData, data, range }: PrintableReportProps) => (
  <Box className="printable-area">
    <Group justify="space-between" align="flex-start" mb="md">
      <Group align="center">
        {schoolData?.logo && <Image src={schoolData.logo} h={80} w="auto" alt="Logo" />}
        <Stack gap={0}>
          <Title order={2} >{schoolData?.name || "Établissement Scolaire"}</Title>
          <Text fz="xs" fw={500}>{schoolData?.address}</Text>
          <Text fz="xs">{schoolData?.phone} | {schoolData?.email}</Text>
        </Stack>
      </Group>
      <Stack gap={2} align="flex-end">
        <Badge variant="outline" color="gray">Rapport Officiel</Badge>
        {schoolData?.nif && <Text fz="xs" fw={700}>NIF: {schoolData.nif}</Text>}
        {schoolData?.stat && <Text fz="xs" fw={700}>STAT: {schoolData.stat}</Text>}
      </Stack>
    </Group>

    <Divider mb="xl" color="gray.3" size="xs" />
    
    <Title ta="center" order={2} mb="xs">BILAN DES ABSENCES</Title>
    <Text ta="center" c="dimmed" mb="xl">
      Période : {range === 'all' ? 'Année Scolaire' : range === 'week' ? '7 derniers jours' : '30 derniers jours'} 
      | Extrait le : {new Date().toLocaleDateString('fr-FR')}
    </Text>

    <Table withTableBorder horizontalSpacing="md" verticalSpacing="sm">
      <Table.Thead bg="gray.1">
        <Table.Tr>
          <Table.Th>Date & Classe</Table.Th>
          <Table.Th>Élève</Table.Th>
          <Table.Th>Matière / Enseignant</Table.Th>
          <Table.Th>Justification / Motif</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((rec: any, i: number) => (
          <Table.Tr key={i}>
            <Table.Td>
              <Text size="xs" fw={700}>{new Date(rec.date).toLocaleDateString()}</Text>
              <Text size="xs">{rec.className}</Text>
            </Table.Td>
            <Table.Td fw={700}>{rec.studentName}</Table.Td>
            <Table.Td>
              <Text size="xs">{rec.subjectName}</Text>
              <Text size="xs" c="dimmed">Prof: {rec.teacherName}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="xs" fw={700}>
                {rec.isJustified ? 'JUSTIFIÉ' : 'INJUSTIFIÉ'}
              </Text>
              {rec.justificationReason && (
                <Text size="xs" fs="italic">Motif: {rec.justificationReason}</Text>
              )}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>

    <Group justify="space-between" mt={100}>
      <Box ta="center">
        <Text fz="xs" mb={50}>Cachet de l'établissement</Text>
      </Box>
      <Box ta="center">
        <Text fz="xs" mb={50}>Signature du Directeur</Text>
      </Box>
    </Group>
  </Box>
);