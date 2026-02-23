

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Title, Paper, Table, Button, Group, Text, SimpleGrid, Box, 
  Stack, ActionIcon, Modal, Badge, ScrollArea, Center, Loader 
} from '@mantine/core';
import { IconPrinter, IconEye, IconArrowLeft } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { AttendanceReport } from '@/components/AttendanceReport';

export default function AttendanceHistoryPage() {
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      const id = localStorage.getItem('school_id');
      if (!id) return;

      try {
        const res = await fetch(`/api/settings/general?schoolId=${id}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Réponse API non-JSON reçue:", errorText);
        return;
      }

      const data = await res.json();
      setSchoolData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchoolInfo();
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      // 1. On récupère le schoolId pour filtrer l'historique
      const activeSchoolId = localStorage.getItem('school_id');
      const activeAnneeId = localStorage.getItem('active_annee_id');

      const res = await fetch(
        `/api/attendance/history?schoolId=${activeSchoolId}&academicYear=${activeAnneeId}`
      );
      
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleViewDetails = (session: any) => {
    setSelectedSession(session);
    open();
  };

  if (loading) return <Center h="80vh"><Loader color="teal" size="sm" /></Center>;

  return (
    <Stack>
      <Group justify="space-between">
        <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} component={Link} href="/dashboard/attendance">
          Retour à l'appel
        </Button>
        <Title order={2} fw={800}>Historique des présences</Title>
      </Group>

      <Paper radius="md" p="md" shadow="sm" withBorder>
        <ScrollArea>
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Classe</Table.Th>
                <Table.Th>Bilan</Table.Th>
                <Table.Th style={{ width: 80 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {history && history.length > 0 ? (
                history.map((item: any) => (
                  <Table.Tr key={item?._id || Math.random()}>
                    <Table.Td fw={500}>
                      {item?.date ? new Date(item.date).toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      }) : 'Date inconnue'}
                    </Table.Td>
                    <Table.Td><Badge variant="outline">{item?.class || "N/A"}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge color="red" variant="">
                          {(item?.absents?.length || 0)} Absences
                        </Badge>
                        <Badge color="orange" variant="">
                          {(item?.retards?.length || 0)} Retards
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="light" 
                        color="teal" 
                        onClick={() => handleViewDetails(item)} 
                        size="lg"
                        disabled={!item}
                      >
                        <IconEye size={20} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Center py="xl">
                      <Text c="dimmed">Aucun historique disponible</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* MODAL DE DÉTAILS */}
      <Modal opened={opened} onClose={close} size="xl" title="Détails de la session" centered>
        <Stack p="md">
          <Title order={4} c="red">Absences</Title>
          <Table withColumnBorders>
             <Table.Thead>
               <Table.Tr><Table.Th>Élève</Table.Th><Table.Th>Justification</Table.Th></Table.Tr>
             </Table.Thead>
             <Table.Tbody>
               {selectedSession?.absents.map((a: any, i: number) => (
                 <Table.Tr key={i}>
                   <Table.Td>{a.name}</Table.Td>
                   <Table.Td>{a.justification || <Text c="dimmed" fs="italic" fz="xs">Non justifié</Text>}</Table.Td>
                 </Table.Tr>
               ))}
             </Table.Tbody>
          </Table>

          <Title order={4} c="orange" mt="md">Retards</Title>
          <Table withColumnBorders>
             <Table.Thead>
               <Table.Tr><Table.Th>Élève</Table.Th><Table.Th>Heure</Table.Th><Table.Th>Motif</Table.Th></Table.Tr>
             </Table.Thead>

             <Table.Tbody>
                {selectedSession?.retards?.map((a: any, i: number) => (
                  <Table.Tr key={i}>
                    <Table.Td>{a?.name}</Table.Td>
                    <Table.Td><Badge size="sm" color="gray">{a.arrivalTime || '--:--'}</Badge></Table.Td>
                    <Table.Td>{a?.justification || "Aucune"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
          </Table>
        </Stack>
      </Modal>

     

      <style jsx global>{`
  #print-area {
    font-family: 'Inter', sans-serif;
    color: #333;
  }

  @media print {
    body * { 
      visibility: hidden; 
    }
    
    #print-area, #print-area * { 
      visibility: visible; 
    }

    #print-area { 
      position: absolute; 
      left: 0; 
      top: 0; 
      width: 100%; 
      margin: 0;
      padding: 0;
    }

    .mantine-Paper-root {
      border: none !important;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .no-print { 
      display: none !important; 
    }
  }
`}</style>
    </Stack>
  );
}