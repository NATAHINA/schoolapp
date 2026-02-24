'use client';
import { useState, useEffect } from 'react';
import { 
  Container, Title, Paper, Text, Group, Stack, Badge, 
  Table, Progress, SimpleGrid, ThemeIcon, Loader, Center, Alert
} from '@mantine/core';
import { IconCash, IconReceipt2, IconAlertCircle, IconCheck, IconInfoCircle } from '@tabler/icons-react';

export default function PaymentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const anneeId = localStorage.getItem('active_annee_id');
    
    fetch(`/api/parents/my-children/payments?userId=${userId}&academicYearId=${anneeId}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <Center h="80vh"><Loader color="blue" /></Center>;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl" fw={900}>Suivi des Paiements</Title>

      <Stack gap="xl">
        {data.map((child) => (
          <Paper key={child.studentId} withBorder radius="md" p="xl" shadow="sm">
            <Group justify="space-between" mb="lg">
              <div>
                <Text fz="xl" fw={700}>{child.studentName}</Text>
                <Text fz="sm" c="dimmed">Récapitulatif financier de l'année</Text>
              </div>

              <Stack gap={5} align="flex-end">
                <Text fz="xs" fw={700} c="dimmed" tt="uppercase">Restes à payer:</Text>
                {Object.entries(child.balance || {}).map(([type, amount]: any) => (
                  amount > 0 && (
                    <Badge 
                      key={type} 
                      variant="light" 
                      color="red" 
                      size="lg"
                      leftSection={<IconInfoCircle size={14} />}
                    >
                      {type} : {amount.toLocaleString()} Ar
                    </Badge>
                  )
                ))}
                {Object.values(child.balance || {}).every(v => v === 0) && (
                  <Badge color="teal" size="lg" variant="filled">Scolarité à jour</Badge>
                )}
              </Stack>
            
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
              <Paper withBorder p="md" radius="md">
                <Group>
                  <ThemeIcon color="teal" size="lg" radius="md">
                    <IconCheck size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>Total Payé</Text>
                    <Text fz="xl" fw={700}>{child.totalPaid?.toLocaleString()} Ar</Text>
                  </div>
                </Group>
              </Paper>
              
              <Paper withBorder p="md" radius="md">
                <Group>
                  <ThemeIcon color="orange" size="lg" radius="md">
                    <IconReceipt2 size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>Dernier Versement</Text>
                    <Text fz="lg" fw={600}>
                      {child.history[0]?.amount?.toLocaleString() || 0} Ar
                    </Text>
                  </div>
                </Group>
              </Paper>
            </SimpleGrid>

            <Text fw={600} mb="xs">Historique des transactions</Text>
            <Table.ScrollContainer minWidth={500}>
              <Table verticalSpacing="sm" striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Type / Mois</Table.Th>
                    <Table.Th>Méthode</Table.Th>
                    <Table.Th ta="right">Montant</Table.Th>
                    <Table.Th>Référence</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {child.history.map((p: any) => (
                    <Table.Tr key={p._id}>
                      <Table.Td>{new Date(p.date).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Text fz="sm" fw={500}>{p.type}</Text>
                        {p.month && <Text fz="xs" c="dimmed">{p.month}</Text>}
                      </Table.Td>
                      <Table.Td><Badge variant="dot" color="blue">{p.method}</Badge></Table.Td>
                      <Table.Td ta="right" fw={700}>{p.amount.toLocaleString()} Ar</Table.Td>
                      <Table.Td><Text fz="xs" ff="monospace">{p.reference || '-'}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}