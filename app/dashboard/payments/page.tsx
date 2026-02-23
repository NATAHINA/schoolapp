


'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Title, Paper, Select, NumberInput, Button, Group, Box,TextInput ,Grid ,
  Table, Badge, Stack, Text, SimpleGrid, Card, ActionIcon, Alert, ScrollArea 
} from '@mantine/core';
import { 
  IconPrinter, IconWallet, IconHistory, IconFilter, IconInfoCircle 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useReactToPrint } from 'react-to-print';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Receipt } from '@/components/Receipt';

export default function PaymentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [allFeeConfigs, setAllFeeConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [activeYearName, setActiveYearName] = useState('');
  
  // Filtres
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>('');
  const [filterClass, setFilterClass] = useState<string | null>(null);
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [availableFeeTypes, setAvailableFeeTypes] = useState<string[]>([]);
  const [feeStatus, setFeeStatus] = useState<any>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const [searchHistory, setSearchHistory] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);

  const paidReportRef = useRef<HTMLDivElement>(null);
  const handlePrintPaidReport = useReactToPrint({ contentRef: paidReportRef });

  const MONTHS = ['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];
  const PAYMENT_METHODS = [
    { value: 'Espèces', label: 'Espèces' },
    { value: 'MVola', label: 'MVola' },
    { value: 'Orange Money', label: 'Orange Money' },
    { value: 'Airtel Money', label: 'Airtel Money' },
    { value: 'Chèque', label: 'Chèque' },
    { value: 'Virement', label: 'Virement' },
    { value: 'TPE', label: 'TPE (Carte)' }
  ];

  const [form, setForm] = useState({
    type: '',
    month: '',
    amount: 0,
    method: 'Espèces'
  });

  const handlePrintReport = useReactToPrint({ contentRef: reportRef });

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = p.student?.name?.toLowerCase().includes(searchHistory.toLowerCase());
      const matchesMethod = !filterMethod || p.method === filterMethod;
      const matchesClass = !filterClass || (p.student?.class?._id === filterClass || p.student?.class === filterClass);
      return matchesSearch && matchesMethod && matchesClass;
    });
  }, [payments, searchHistory, filterMethod, filterClass]);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    const schoolId = localStorage.getItem('school_id');
    const academicYear = localStorage.getItem('active_annee_id');
    if (!schoolId) return;

    try {
      const [resS, resP, resC, resCl] = await Promise.all([
        fetch(`/api/students?schoolId=${schoolId}`),
        fetch(`/api/payments?schoolId=${schoolId}&academicYear=${academicYear}`),
        fetch(`/api/settings/fee-config?schoolId=${schoolId}&academicYear=${academicYear}`),
        fetch(`/api/settings/classes?schoolId=${schoolId}`)
      ]);

      const ds = await resS.json();
      const dp = await resP.json();
      const dc = await resC.json();
      const dcl = await resCl.json();

      setStudents(Array.isArray(ds) ? ds : []);
      setPayments(Array.isArray(dp) ? dp : []);
      setAllFeeConfigs(Array.isArray(dc) ? dc : []);
      setClasses(Array.isArray(dcl) ? dcl.map(c => ({ value: c._id, label: c.name })) : []);
      
      if (Array.isArray(dp) && dp.length > 0) {
        if (dp[0].schoolId) {
          setSchoolInfo(dp[0].schoolId);
        }
        
        if (dp[0].academicYear?.name) {
          setActiveYearName(dp[0].academicYear.name);
        }
      } else {
        console.warn("Aucun paiement trouvé pour extraire schoolId ou academicYear");
      }

    } catch (e) { 
      console.error("Erreur lors du chargement :", e); 
    }
  };

  // --- LOGIQUE DES IMPAYÉS (CALCUL MÉMORISÉ) ---
  const unpaidList = useMemo(() => {
    return students
      .filter(s => !filterClass || (s.class?._id === filterClass || s.class === filterClass))
      .flatMap(student => {
        const classId = student.class?._id || student.class;
        const configs = allFeeConfigs.filter(c => (c.classId?._id === classId || c.classId === classId));
        const sPayments = payments.filter(p => (p.student?._id === student._id || p.student === student._id));
        
        const debts: any[] = [];
        configs.forEach(config => {
          if (config.feeType === 'Écolage' || config.category === 'Mensuel') {
            if (filterMonth) {
              const paid = sPayments.find(p => p.type === config.name && p.month === filterMonth)?.amount || 0;
              if (paid < config.amount) debts.push({ name: student.name, motif: `${config.name} (${filterMonth})`, due: config.amount - paid, id: student._id });
            }
          } else {
            const paid = sPayments.filter(p => p.type === config.name).reduce((sum, p) => sum + p.amount, 0);
            if (paid < config.amount) debts.push({ name: student.name, motif: config.name, due: config.amount - paid, id: student._id });
          }
        });
        return debts;
      });
  }, [students, payments, allFeeConfigs, filterMonth, filterClass]);

  const totalEncaisse = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
  const totalImpayes = useMemo(() => unpaidList.reduce((acc, d) => acc + d.due, 0), [unpaidList]);

  const chartData = [
    { name: 'Encaissé', value: totalEncaisse },
    { name: 'Impayés', value: totalImpayes },
  ];
  const COLORS = ['#0ca678', '#f03e3e'];

  // --- LOGIQUE FORMULAIRE ---
  useEffect(() => {
    if (!selectedStudent) { setAvailableFeeTypes([]); return; }
    const student = students.find(s => s._id === selectedStudent);
    const classId = student?.class?._id || student?.class;
    const configs = allFeeConfigs.filter(c => c.classId?._id === classId || c.classId === classId);
    setAvailableFeeTypes(configs.map(c => c.name));
  }, [selectedStudent, allFeeConfigs]);

  const handleFeeTypeChange = (typeName: string) => {
    const config = allFeeConfigs.find(c => c.name === typeName);
    if (!config) return;

    const isMonthly = config.feeType === 'Écolage' || config.category === 'Mensuel';
    
    let autoMonth = '';
    if (isMonthly) {
      const paidMonths = payments
        .filter(p => (p.student?._id === selectedStudent || p.student === selectedStudent) && p.type === typeName)
        .map(p => p.month);
      autoMonth = MONTHS.find(m => !paidMonths.includes(m)) || '';
    }

    setForm(prev => ({ 
      ...prev, 
      type: typeName, 
      month: autoMonth,
      amount: config.amount 
    }));
  };

  const handleSumbit = async () => {
    if (!selectedStudent || form.amount <= 0) {
      notifications.show({ 
        title: 'Erreur', 
        message: 'Veuillez sélectionner un élève et un montant valide', 
        color: 'red' 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          student: selectedStudent, 
          schoolId: localStorage.getItem('school_id'), 
          academicYear: localStorage.getItem('active_annee_id') 
        })
      });

      if (res.ok) {
        notifications.show({ title: 'Succès', message: 'Paiement enregistré avec succès', color: 'teal' });
        
        setSelectedStudent(null);
        setForm({
          type: '',
          month: '',
          amount: 0,
          method: 'Espèces'
        });
        setFeeStatus(null);
        
        fetchInitialData();
      } else {
        notifications.show({ title: 'Erreur', message: 'Erreur lors de l\'enregistrement', color: 'red' });
      }
    } catch (e) { 
      console.error(e);
      notifications.show({ title: 'Erreur', message: 'Erreur de connexion au serveur', color: 'red' });
    } finally { 
      setLoading(false); 
    }
  };

  const handleCancel = () => {
    setSelectedStudent(null);
    setForm({ type: '', month: '', amount: 0, method: 'Espèces' });
    setFeeStatus(null);
  };

  const handlePrintReceipt = useReactToPrint({ 
    contentRef: receiptRef,
    documentTitle: `Recu_${selectedPayment?.reference || 'paiement'}`,
    pageStyle: `
      @page { 
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body { 
          margin: 0; 
          -webkit-print-color-adjust: exact;
        }
        .no-print { display: none; } 
      }
    ` 
  });


  const HeaderReport = ({ school, yearName }: { school: any, yearName: string }) => {
    const fallbackYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    return (
      <Grid mb={20} align="center" style={{ borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <Grid.Col span={6}>
          {school?.logo && <img src={school.logo} alt="Logo" style={{ width: '85px' }} />}

          <Title order={3}>{school?.name?.toUpperCase() || "ÉTABLISSEMENT SCOLAIRE"}</Title>
        </Grid.Col>
        <Grid.Col span={6} ta="right">
          
          <Text fz="sm">{school?.address || "Adresse non définie"}</Text>
          <Text fz="sm">Tél : {school?.phone || school?.tel || "Aucune"}</Text>
          {school?.email && (<Text fz="sm">Email : {school.email}</Text>)}
          {school?.nif && (<Text fz="sm">NIF : {school.nif}</Text>)}
          {school?.stat && (<Text fz="sm">STAT : {school.stat}</Text>)}
          <Text fz="xs">Année Scolaire : {yearName || fallbackYear}</Text>
        </Grid.Col>
      </Grid>
    );
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={2} fw={800} fz={{ base: 'h3', sm: 'h2' }}>Caisse & Scolarité</Title>
          <Text fz="sm" c="dimmed" visibleFrom="sm">Suivi des encaissements et recouvrement</Text>
        </Stack>
        <Badge size="xl" color="blue" variant="light" radius="sm">
          {totalEncaisse.toLocaleString()} Ar encaissés
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {/* GRAPHIQUE RECHARTS */}
        <Card withBorder radius="md" h={300}>
          <Text fw={700} fz="xs" c="dimmed" ta="center" mb="sm">RECOUVREMENT (CLASSE ACTUELLE)</Text>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
              </Pie>
              <Tooltip 
                formatter={(value: any) => {
                  const amount = value ?? 0;
                  return `${amount.toLocaleString()} Ar`;
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* FORMULAIRE */}
        <Paper withBorder p="md" radius="md" style={{ gridColumn: 'span 2' }}>
          <Title order={4} mb="md">Nouveau Paiement</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Stack>
              <Select 
                label="Élève" 
                data={students.map(s => ({ value: s._id, label: s.name }))} 
                searchable 
                value={selectedStudent} 
                onChange={setSelectedStudent} 
                placeholder="Rechercher un élève..."
              />
              <Group grow align="flex-start">
                <Select 
                  label="Type de Frais" 
                  data={availableFeeTypes} 
                  value={form.type} 
                  onChange={(v) => handleFeeTypeChange(v || '')} 
                />
                {/* On affiche le mois si le type sélectionné est mensuel */}
                {(allFeeConfigs.find(c => c.name === form.type)?.feeType === 'Écolage' || 
                  allFeeConfigs.find(c => c.name === form.type)?.category === 'Mensuel') && (
                  <Select 
                    label="Mois" 
                    data={MONTHS} 
                    value={form.month} 
                    onChange={(v) => setForm({...form, month: v || ''})} 
                  />
                )}
              </Group>
            </Stack>

            <Stack justify="flex-end">
              {feeStatus && (
                <Alert icon={<IconInfoCircle size={16} />} color="blue" py="xs">
                  <Text fz="xs">Total dû: {feeStatus.totalDue.toLocaleString()} Ar</Text>
                  <Text fz="sm" fw={700}>Reste à payer: {feeStatus.remaining.toLocaleString()} Ar</Text>
                </Alert>
              )}
              <NumberInput 
                label="Montant à encaisser" 
                value={form.amount} 
                onChange={(v) => setForm({...form, amount: Number(v)})} 
                thousandSeparator=" "
                suffix=" Ar"
              />

              <Select 
                label="Mode de paiement" 
                data={PAYMENT_METHODS} 
                value={form.method} 
                onChange={(v) => setForm({...form, method: v || 'Espèces'})} 
              />

              <Group grow mt="xs">
                <Button 
                  variant="light" 
                  color="gray" 
                  onClick={handleCancel}
                  disabled={loading || (!selectedStudent && !form.type)}
                >
                  Annuler
                </Button>
                
                <Button 
                  onClick={handleSumbit} 
                  loading={loading} 
                  disabled={!selectedStudent || form.amount <= 0 || feeStatus?.remaining === 0}
                >
                  Encaisser
                </Button>
              </Group>
            </Stack>
          </SimpleGrid>
        </Paper>
      </SimpleGrid>

      {/* FILTRES ET TABLEAU IMPAYÉS */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
          <Title order={4}>Suivi des Impayés</Title>
          <Group>
            <Select placeholder="Classe" data={classes} value={filterClass} onChange={setFilterClass} clearable size="xs" />
            <Select placeholder="Mois" data={MONTHS} value={filterMonth} onChange={setFilterMonth} clearable size="xs" />
            <Button leftSection={<IconPrinter size={16} />} 
              variant="outline" 
              color="teal" 
              size="xs" 
              onClick={handlePrintReport}>Imprimer Rapport
            </Button>
          </Group>
        </Group>
        <ScrollArea h={300}>
          <Table striped>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Élève</Table.Th>
                <Table.Th>Détails</Table.Th>
                <Table.Th ta="right">Reste</Table.Th>
                <Table.Th ta="right">Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {unpaidList.map((d, i) => (
                <Table.Tr key={i}>
                  <Table.Td fz="sm">{d.name}</Table.Td>
                  <Table.Td><Badge color="orange" variant="light">{d.motif}</Badge></Table.Td>
                  <Table.Td ta="right" fw={700} c="red">{d.due.toLocaleString()} Ar</Table.Td>
                  <Table.Td ta="right"><Button size="compact-xs" variant="subtle" onClick={() => setSelectedStudent(d.id)}>Régler</Button></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* HISTORIQUE */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <IconHistory size={20} />
              <Title order={4}>Historique des Paiements (Liste Payée)</Title>
            </Group>
            <Button 
              leftSection={<IconPrinter size={16} />} 
              variant="outline" 
              color="teal" 
              size="xs"
              onClick={() => handlePrintPaidReport()}
            >
              Imprimer Liste Payée
            </Button>
          </Group>

          {/* Filtres de recherche pour l'historique */}
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Select 
              placeholder="Filtrer par Mode" 
              data={PAYMENT_METHODS} 
              value={filterMethod} 
              onChange={setFilterMethod} 
              clearable 
              size="xs" 
            />
            <Select 
              placeholder="Filtrer par Classe" 
              data={classes} 
              value={filterClass} 
              onChange={setFilterClass} 
              clearable 
              size="xs" 
            />
            <TextInput 
              placeholder="Rechercher un élève..." 
              value={searchHistory} 
              onChange={(e) => setSearchHistory(e.currentTarget.value)} 
              size="xs" 
            />
          </SimpleGrid>

          <ScrollArea h={400}>
            <Table verticalSpacing="sm" striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Élève</Table.Th>
                  <Table.Th>Détails</Table.Th>
                  <Table.Th ta="right">Montant</Table.Th>
                  <Table.Th ta="center">Reçu</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPayments.map((p) => (
                  <Table.Tr key={p._id}>
                    <Table.Td fz="xs">{new Date(p.date).toLocaleDateString()}</Table.Td>
                    <Table.Td fz="sm" fw={500}>{p.student?.name}</Table.Td>
                    <Table.Td>
                      <Badge size="xs" variant="light" color="cyan">{p.method}</Badge>
                      <Text fz="10px" c="dimmed">{p.type} {p.month && `(${p.month})`}</Text>
                    </Table.Td>
                    <Table.Td ta="right" fw={700}>{p.amount.toLocaleString()} Ar</Table.Td>
                    <Table.Td ta="center">
                      <ActionIcon variant="subtle" onClick={async () => { await setSelectedPayment(p); handlePrintReceipt(); }}>
                        <IconPrinter size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
      </Paper>
      
      {/* IMPRESSION */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef}><Receipt data={selectedPayment} /></div>

        {/* RAPPORT DES IMPAYÉS */}
        <div ref={reportRef} style={{ padding: '40px', fontFamily: 'sans-serif', width: '210mm' }}>
          <HeaderReport school={schoolInfo} yearName={activeYearName || "2025-2026"}/>
          
          <Title order={3} ta="center" mb="xl" style={{ textDecoration: 'underline' }}>
            LISTE DES IMPAYÉS
          </Title>
          
          <Group justify="space-between" mb="md">
            <Text fw={600}>Classe : {filterClass ? classes.find(c => c.value === filterClass)?.label : 'Toutes les classes'}</Text>
            <Text fw={600}>Mois : {filterMonth || 'Tous les mois'}</Text>
          </Group>

          <Table withTableBorder withColumnBorders verticalSpacing="xs">
            <Table.Thead bg="gray.1">
              <Table.Tr>
                <Table.Th>Élève</Table.Th>
                <Table.Th>Détails (Motif/Mois)</Table.Th>
                <Table.Th ta="right">Reste à Payer</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {unpaidList.map((d, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{d.name}</Table.Td>
                  <Table.Td>{d.motif}</Table.Td>
                  <Table.Td ta="right" fw={700}>{d.due.toLocaleString()} Ar</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th colSpan={2} ta="right">TOTAL GÉNÉRAL :</Table.Th>
                <Table.Th ta="right" bg="gray.1" fz="lg">
                  {unpaidList.reduce((acc, curr) => acc + curr.due, 0).toLocaleString()} Ar
                </Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
          
          <Text fz="xs" ta="right" mt={50}>Fait, le {new Date().toLocaleDateString()}</Text>
        </div>

        {/* JOURNAL DES ENCAISSEMENTS (LISTE PAYÉE) */}
        <div ref={paidReportRef} style={{ padding: '40px', fontFamily: 'sans-serif', width: '210mm' }}>
          <HeaderReport school={schoolInfo} yearName={activeYearName || "2025-2026"}/>

          <Title order={3} ta="center" mb="xl" style={{ textDecoration: 'underline' }}>
            JOURNAL DES ENCAISSEMENTS
          </Title>

          <Group justify="space-between" mb="lg">
            <Stack gap={0}>
              <Text fz="sm"><b>Filtre Mode :</b> {filterMethod || 'Tous'}</Text>
              <Text fz="sm"><b>Période :</b> Journalier ({new Date().toLocaleDateString()})</Text>
            </Stack>
            <Box p="md" style={{ border: '1px solid #ccc' }}>
              <Text fz="sm">TOTAL ENCAISSÉ</Text>
              <Title order={3}>{filteredPayments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()} Ar</Title>
            </Box>
          </Group>

          <Table withTableBorder withColumnBorders verticalSpacing="xs">
            <Table.Thead bg="gray.1">
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Élève</Table.Th>
                <Table.Th>Motif</Table.Th>
                <Table.Th>Mode</Table.Th>
                <Table.Th ta="right">Montant</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredPayments.map((p, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{new Date(p.date).toLocaleDateString()}</Table.Td>
                  <Table.Td>{p.student?.name}</Table.Td>
                  <Table.Td>{p.type} {p.month && `(${p.month})`}</Table.Td>
                  <Table.Td>{p.method}</Table.Td>
                  <Table.Td ta="right">{p.amount.toLocaleString()} Ar</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Grid mt={50} ta="center">
            <Grid.Col span={4}><Text size="sm" fw={600}>Le Caissier</Text></Grid.Col>
            <Grid.Col span={4}></Grid.Col>
            <Grid.Col span={4}><Text size="sm" fw={600}>La Direction</Text></Grid.Col>
          </Grid>
        </div>
      </div>
    </Stack>
  );
}

