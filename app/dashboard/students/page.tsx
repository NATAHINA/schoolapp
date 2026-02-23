'use client';


import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Table, Group, Text, ActionIcon, ScrollArea, TextInput, 
  Button, Badge, Paper, Title, Modal, LoadingOverlay, 
  Select, Stack, SimpleGrid, Pagination, Center, rem, Box, 
  Autocomplete
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { DateInput } from '@mantine/dates';
import { 
  IconDownload, IconPencil, IconTrash, IconSearch, IconPlus, IconAlertTriangle, IconFileSpreadsheet 
} from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
dayjs.locale('fr');

interface Student {
  _id: string;
  name: string;
  matricule: string;
  class: any;
  gender: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  schoolId: string;
  date_naissance: Date | string;
  lieu_naissance: string;
}

export default function StudentsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([]);
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string; phone: string }[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activePage, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Importer excel
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const activeSchoolId = localStorage.getItem('school_id');
        const activeAnneeId = localStorage.getItem('active_annee_id');

        const res = await fetch('/api/students/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            students: jsonData, 
            schoolId: activeSchoolId,
            academicYear: activeAnneeId
          }),
        });

        if (!res.ok) throw new Error("Échec de l'importation");

        notifications.show({
          title: 'Importation réussie',
          message: `${jsonData.length} élèves ont été ajoutés`,
          color: 'teal',
        });
        
        fetchData(); // Rafraîchir la table
      } catch (error) {
        notifications.show({ title: 'Erreur', message: "Le fichier Excel est mal formaté", color: 'red' });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
      }
    };
    reader.readAsArrayBuffer(file);
  };


  const downloadTemplate = () => {
    const templateData = [
      {
        "Matricule": "Ex:00001-M",
        "Nom": "Ex: RAKOTO Jean",
        "Genre": "M ou F",
        "Date Naissance": "2015-05-12",
        "Lieu Naissance": "Tamatave",
        "Classe": "Nom exact de la classe",
        "Parent": "Nom du parent ou tuteur",
        "Telephone": "0340000000",
        "Email": "parent@exemple.com"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modele_Import");

    XLSX.writeFile(workbook, "modele_import_eleves.xlsx");
  };

// fin export

  const studentForm = useForm({
    initialValues: {
      matricule: '',
      name: '',
      class: '',
      gender: 'M',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      date_naissance: null as Date | string | null,
      lieu_naissance: '',
    },
    validate: {
      parentEmail: (value) => {
        if (!value) return null;
        return /^\S+@\S+$/.test(value) ? null : 'Email invalide';
      },
      name: (val) => (val.length < 2 ? 'Nom trop court' : null),
      class: (val) => (!val ? 'Sélectionnez une classe' : null),
      parentPhone: (val) => (val.length < 8 ? 'Numéro invalide' : null),
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const activeSchoolId = localStorage.getItem('school_id');
    const activeAnneeId = localStorage.getItem('active_annee_id');
    
    if (!activeSchoolId || !activeAnneeId) {
        notifications.show({ title: 'Erreur', message: 'École ou Année scolaire non identifiée', color: 'red' });
        setLoading(false);
        return;
    }

    try {
      const [resClasses, resStudents, resParents] = await Promise.all([
        fetch(`/api/settings/classes?schoolId=${activeSchoolId}`),
        fetch(`/api/students?schoolId=${activeSchoolId}&academicYear=${activeAnneeId}`),
        fetch(`/api/parents?schoolId=${activeSchoolId}`)
      ]);

      if (!resClasses.ok || !resStudents.ok || !resParents.ok) {
        const errorData = await resStudents.json();
        throw new Error(errorData.error || "Erreur lors de la récupération");
      }

      const dataClasses = await resClasses.json();
      const dataStudents = await resStudents.json();
      const dataParents = await resParents.json();

      // Mise à jour des classes
      if (Array.isArray(dataClasses)) {
        setClassOptions(dataClasses.map((c: any) => ({ value: c._id, label: c.name })));
      }

      // Mise à jour des élèves
      setStudents(Array.isArray(dataStudents) ? dataStudents : []);

      // Mise à jour des parents pour l'auto-complétion
      if (Array.isArray(dataParents)) {
        setParentOptions(dataParents.map((p: any) => ({
          value: p.name,
          label: `${p.name} (${p.phone})`,
          phone: p.phone,
          email: p.email
        })));
      }
    } catch (error: any) {
      console.error("DEBUG FETCH:", error); 
      notifications.show({ 
          title: 'Erreur', 
          message: error.message || 'Échec du chargement des données', 
          color: 'red' 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- RECHERCHE & FILTRE ---
  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();
    
    return students.filter((item) => {
      if (!item) return false;

      let className = "";
      if (item.class && typeof item.class === 'object') {
        className = item.class.name || "";
      } else {
        className = classOptions.find(c => c.value === item.class)?.label || "";
      }

      return (
        (item.matricule || "").toLowerCase().includes(query) ||
        (item.name || "").toLowerCase().includes(query) ||
        className.toLowerCase().includes(query) ||
        (item.parentPhone || "").includes(query) ||
        (item.parentName || "").toLowerCase().includes(query) ||
        (item.parentEmail  || "").toLowerCase().includes(query)

      );
    });
  }, [students, search, classOptions]);

  const paginatedStudents = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, activePage]);

  // --- ACTIONS ---
  const handleEditClick = (student: Student) => {
    setEditingId(student._id);
    
    // On extrait l'ID de la classe qu'elle soit peuplée ou non
    const classId = student.class?._id || student.class;

    studentForm.setValues({
      matricule: student.matricule,
      name: student.name,
      class: classId,
      gender: student.gender || 'M',
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      date_naissance: student.date_naissance ? new Date(student.date_naissance) : null,
      lieu_naissance: student.lieu_naissance || '',
    });
    open();
  };

  const handleSubmit = async (values: typeof studentForm.values) => {
    setLoading(true);
    const activeSchoolId = localStorage.getItem('school_id');
    const activeAnneeId = localStorage.getItem('active_annee_id');

    const url = editingId ? `/api/students/${editingId}` : '/api/students';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, schoolId: activeSchoolId, academicYear: activeAnneeId }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      notifications.show({ 
        title: 'Succès', 
        message: editingId ? 'Mise à jour réussie' : 'Inscription réussie', 
        color: 'teal' 
      });
      
      close();
      setEditingId(null);
      fetchData(); // Rafraîchir tout
    } catch (error: any) {
      notifications.show({ title: 'Erreur', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (id: string, name: string) =>
    modals.openConfirmModal({
      title: 'Supprimer l\'élève',
      children: <Text size="sm">Voulez-vous vraiment supprimer <b>{name}</b> ?</Text>,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        fetchData();
      },
    });

  return (
    <>
      
      <Group justify="space-between" mb="xl">
        
        <Stack gap={0}>
          <Title order={2} fw={800}>Gestion des Élèves</Title>
          <Text fz="xs" c="dimmed">{filteredStudents.length} élèves filtrés</Text>
        </Stack>
        
        <Group>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx, .xls, .csv"
            onChange={handleImportExcel}
          />
          
          <Button 
            variant="light" 
            color="teal" 
            leftSection={<IconFileSpreadsheet size={18} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Importer Excel
          </Button>

          <ActionIcon 
            variant="outline" 
            size="lg" 
            title="Télécharger le modèle Excel"
            onClick={downloadTemplate}
          >
            <IconDownload size={18} />
          </ActionIcon>

          <Button 
            leftSection={<IconPlus size={18} />} 
            onClick={() => { studentForm.reset(); setEditingId(null); open(); }}
          >
            Nouvel Élève
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" p="md" pos="relative" shadow="sm">
        <LoadingOverlay visible={loading} />
        
        <TextInput
          placeholder="Rechercher un élève, une classe ou un parent..."
          mb="md"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
        />

        <ScrollArea>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>N°</Table.Th>
                <Table.Th>Nom & Contact</Table.Th>
                <Table.Th>Classe</Table.Th>
                <Table.Th>Date&Lieu de naissance</Table.Th>
                <Table.Th>Parent</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedStudents.map((item) => {
                const displayClassName = item.class?.name || 
                                       classOptions.find(c => c.value === item.class)?.label || 
                                       "Classe inconnue";

                return (
                  <Table.Tr key={item._id}>
                    <Table.Td>
                      <Text fz="sm" fw={500}>{item.matricule || ''}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm" fw={500}>{item.name}</Text>
                      <Text fz="xs" c="dimmed">{item.parentPhone}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="dot" color={displayClassName === "Classe inconnue" ? "red" : "blue"}>
                        {displayClassName}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {item.date_naissance ? new Date(item.date_naissance).toLocaleDateString('fr-FR') : '-'}
                      <Text fz="xs" c="dimmed">{item.lieu_naissance}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm">{item.parentName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="light" onClick={() => handleEditClick(item)}><IconPencil size={16} /></ActionIcon>
                        <ActionIcon variant="light" color="red" onClick={() => openDeleteConfirm(item._id, item.name)}><IconTrash size={16} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Center mt="xl">
          <Pagination total={Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)} value={activePage} onChange={setPage} color="teal" />
        </Center>
      </Paper>

      <Modal opened={opened} onClose={close} title={editingId ? "Modifier l'élève" : "Inscrire un élève"} centered size="lg">
         <form onSubmit={studentForm.onSubmit(handleSubmit)}>
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="N° Matricule" {...studentForm.getInputProps('matricule')} />
              <TextInput label="Nom de l'élève" required {...studentForm.getInputProps('name')} />
              <Select 
                label="Classe" 
                data={classOptions} 
                placeholder="Choisir une classe"
                required 
                searchable
                {...studentForm.getInputProps('class')} 
              />
            </SimpleGrid>

            <Select 
              label="Genre" 
              data={[{ label: 'Masculin', value: 'M' }, { label: 'Féminin', value: 'F' }]} 
              {...studentForm.getInputProps('gender')} 
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <DateInput 
                label="Date de naissance" 
                placeholder="Sélectionner une date"
                clearable
                valueFormat="DD/MM/YYYY"
                locale="fr"
                {...studentForm.getInputProps('date_naissance')} 
              />
              <TextInput 
                label="Lieu de naissance" 
                placeholder="Ville ou commune"
                required
                {...studentForm.getInputProps('lieu_naissance')} 
              />
            </SimpleGrid>

           <Paper withBorder p="md" radius="md">
            <Text fw={700} fz="xs" mb="sm" c="dimmed">COORDONNÉES PARENTALES</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              <Autocomplete
                label="Nom du parent"
                placeholder="Chercher ou saisir"
                data={parentOptions}
                required
                {...studentForm.getInputProps('parentName')}
                onOptionSubmit={(val) => {
                  const parent = parentOptions.find(p => p.value === val);
                  if (parent) {
                    studentForm.setFieldValue('parentPhone', parent.phone || '');
                    studentForm.setFieldValue('parentEmail', (parent as any).email || ''); 
                  }
                }}
              />
              <TextInput label="Téléphone" placeholder="+261..." required {...studentForm.getInputProps('parentPhone')} value={studentForm.values.parentPhone || ''}/>
              <TextInput label="Email" placeholder="myemail@gmail.com"  {...studentForm.getInputProps('parentEmail')} value={studentForm.values.parentEmail || ''} />
            </SimpleGrid>
           </Paper>

            <Button type="submit" fullWidth size="md" loading={loading}>
              {editingId ? 'Mettre à jour' : 'Confirmer l\'inscription'}
            </Button>
          </Stack>
         </form>
      </Modal>
    </>
  );
}