import { Box, Text, Stack, Divider, Center } from '@mantine/core';
import { forwardRef } from 'react';

interface ReceiptProps {
  data: any;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data }, ref) => {
  if (!data) return null;

  return (
    <Box 
      ref={ref} 
      p={10} 
      style={{ 
        backgroundColor: 'white', 
        color: 'black', 
        width: '80mm',
        padding: '4mm',
        fontFamily: 'monospace', // Police type ticket de caisse
        fontSize: '12px'
      }}
    >
      {/* --- EN-TETE TICKET --- */}
      <Stack align="center" gap={2} mb={10}>
        {data.schoolId?.logo && (
          <img src={data.schoolId.logo} alt="Logo" style={{ width: '80px', filter: 'grayscale(1)' }} />
        )}
        <Text fw={900} fz="sm" ta="center">{data.schoolId?.name?.toUpperCase() || "MON ECOLE"}</Text>
        <Text fz="xs" ta="center">{data.schoolId?.address || "Adresse..."}</Text>
        <Text fz="xs" ta="center">Tel: {data.schoolId?.phone || "Contact..."}</Text>
      </Stack>

      <Divider variant="dashed" my={5} />

      {/* --- INFOS PAIEMENT --- */}
      <Center><Text fw={700} fz="xs">REÇU DE PAIEMENT</Text></Center>
      <Center><Text fz="xs">N° {data.reference}</Text></Center>
      
      <Divider variant="dashed" my={5} />

      <Stack gap={2}>
        <Text fz="xs">DATE: {new Date(data.date).toLocaleDateString()}</Text>
        <Text fz="xs">ELEVE: <b>{data.student?.name?.toUpperCase()}</b></Text>
        <Text fz="xs">MOTIF: {data.type}</Text>
        {data.month && <Text fz="xs">MOIS: {data.month.toUpperCase()}</Text>}
      </Stack>

      <Divider variant="dashed" my={5} />

      {/* --- MONTANTS --- */}
      <Stack gap={2}>
        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text fz="sm" fw={700}>TOTAL PAYÉ:</Text>
          <Text fz="sm" fw={700}>{data.amount?.toLocaleString()} Ar</Text>
        </Box>
        
        {data.remainingAfter > 0 ? (
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Text fz="xs">RESTE À PAYER:</Text>
            <Text fz="xs" fw={700}>{data.remainingAfter?.toLocaleString()} Ar</Text>
          </Box>
        ) : (
          <Center mt={2} style={{ border: '1px solid black' }}>
            <Text fz="xs" fw={900}>SOLDE RÉGLÉ</Text>
          </Center>
        )}
      </Stack>

      <Divider variant="dashed" my={10} />

      {/* --- PIED DE PAGE --- */}
      <Stack align="center" gap={2} mt={10}>
        <Text fz="xs">Merci pour votre confiance !</Text>
        <Text fz="xs" fs="italic">Logiciel EduManager</Text>
        <Text fz="xs">----------------------------</Text>
        <Box h={40} /> {/* Espace pour la découpe du papier */}
      </Stack>
    </Box>
  );
});

Receipt.displayName = 'Receipt';



