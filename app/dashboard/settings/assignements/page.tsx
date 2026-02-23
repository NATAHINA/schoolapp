'use client';

import { useState, useEffect } from 'react';
import { 
  Title, Paper, Group, Button, Select, Stack, 
  NumberInput, TextInput, Divider, SimpleGrid, 
  Text, ActionIcon, Table, Badge, Card
} from '@mantine/core';
import { IconLink, IconUser, IconBook, IconSchool, IconTrash, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function AssignmentsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState<string | null>(null);

  // État du formulaire
  const [form, setForm] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    hoursPerWeek: 1,
    room: ''
  });


  const filteredAssignments = filterClass 
  ? assignments.filter((item: any) => item.classId?._id === filterClass)
  : assignments;

  const fetchData = async () => {
    const schoolId = localStorage.getItem('school_id');

    setLoading(true);
    try {
      const urls = [
        `/api/settings/classes?schoolId=${schoolId}`,
        `/api/settings/subjects?schoolId=${schoolId}`,
        `/api/teachers?schoolId=${schoolId}`, // Utilisation de votre route teachers
        `/api/settings/class-subjects?schoolId=${schoolId}`
      ];

      const [dataClasses, dataSubjects, dataTeachers, dataAssignments] = await Promise.all(
        urls.map(url => fetch(url).then(res => res.ok ? res.json() : []))
      );
      
      setClasses(dataClasses);
      setSubjects(dataSubjects);
      setTeachers(dataTeachers); // Ici, teachers contient maintenant la liste
      setAssignments(dataAssignments);
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Échec du chargement', color: 'red' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);


  const handleCreateAssignment = async () => {
    if (!form.classId || !form.subjectId || !form.teacherId) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/settings/class-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, schoolId: localStorage.getItem('school_id') }),
      });

      if (res.ok) {
        notifications.show({ 
          title: 'Liaison réussie', 
          message: 'Matière attribuée avec succès', 
          color: 'teal' 
        });
        
        setForm({ classId: '', subjectId: '', teacherId: '', hoursPerWeek: 1, room: '' });
        
        fetchData(); 
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la liaison");
      }
    } catch (error: any) {
      notifications.show({ 
        title: 'Erreur', 
        message: error.message || 'Cette liaison existe déjà pour cette classe', 
        color: 'red' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette attribution ?")) return;
    
    try {
      const res = await fetch(`/api/settings/class-subjects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notifications.show({ title: 'Supprimé', message: 'Liaison retirée', color: 'orange' });
        fetchData(); // Rafraîchir la liste
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Action impossible', color: 'red' });
    }
  };

  return (
    <Stack gap="xl">
      <Title order={2}>Attribution des Matières</Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* FORMULAIRE DE LIAISON */}
        <Paper withBorder p="xl" radius="md" shadow="sm">
          <Stack>
            <Group gap="xs">
              <IconLink size={20} color="var(--mantine-color-blue-filled)" />
              <Text fw={700} fz="lg">Nouvelle Attribution</Text>
            </Group>
            <Divider />

            <Select
              label="Sélectionner la Classe"
              placeholder="Ex: 3ème A"
              leftSection={<IconSchool size={16} />}
              data={classes.map((c: any) => ({ value: c._id, label: c.name }))}
              onChange={(val) => setForm({ ...form, classId: val || '' })}
              searchable
            />

            <Select
              label="Matière à enseigner"
              placeholder="Ex: Mathématiques"
              leftSection={<IconBook size={16} />}
              data={subjects.map((s: any) => ({ value: s._id, label: `${s.name} (Coeff: ${s.coeff})` }))}
              onChange={(val) => setForm({ ...form, subjectId: val || '' })}
              searchable
            />

            <Select
              label="Enseignant responsable"
              placeholder="Chercher un professeur par nom"
              leftSection={<IconUser size={16} />}
              data={teachers.map((t: any) => ({ 
                value: t._id, 
                label: t.name 
              }))}
              value={form.teacherId}
              onChange={(val) => setForm({ ...form, teacherId: val || '' })}
              searchable
            />

            <Group grow>
              <NumberInput
                label="Heures / Semaine"
                min={1}
                value={form.hoursPerWeek}
                onChange={(val) => setForm({ ...form, hoursPerWeek: Number(val) })}
              />
              <TextInput
                label="Salle"
                placeholder="Ex: Salle 102"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              />
            </Group>

            <Button 
              fullWidth 
              size="md" 
              mt="md" 
              loading={loading}
              onClick={handleCreateAssignment}
              disabled={!form.classId || !form.subjectId || !form.teacherId}
            >
              Lier la matière
            </Button>
          </Stack>
        </Paper>

        {/* RÉSUMÉ VISUEL (Preview) */}
        <Card withBorder radius="md" p="xl">
          <Text fw={600} mb="md" c="dimmed">Aperçu de l'attribution</Text>
          {form.classId && form.subjectId && form.teacherId ? (
            <Stack>
                <Text component="div">La classe <Badge size="lg">{classes.find((c:any) => c._id === form.classId)?.name}</Badge></Text>
                <Text component="div">étudiera les <Badge color="green" size="lg">{subjects.find((s:any) => s._id === form.subjectId)?.name}</Badge></Text>
                <Text component="div">avec <Badge color="orange" size="lg">{teachers.find((t:any) => t._id === form.teacherId)?.name}</Badge></Text>
                <Divider label="Configuration" labelPosition="center" />
                <Text fz="sm" ta="center">Volume horaire : <b>{form.hoursPerWeek}h/semaine</b> dans la <b>{form.room || 'salle non définie'}</b></Text>
            </Stack>
          ) : (
            <Stack align="center" justify="center" h={200} c="dimmed">
              <IconLink size={40} stroke={1} />
              <Text fz="sm">Remplissez le formulaire pour voir l'aperçu</Text>
            </Stack>
          )}
        </Card>
      </SimpleGrid>

      {/* TABLEAU DES ATTRIBUTIONS EXISTANTES */}
      <Group justify="space-between" mt="xl" mb="md">
        <Title order={4}>Liste des Attributions</Title>
        <Select
          placeholder="Filtrer par classe"
          clearable
          data={classes.map((c: any) => ({ value: c._id, label: c.name }))}
          value={filterClass}
          onChange={setFilterClass}
          style={{ width: 250 }}
        />
      </Group>

      <Paper withBorder radius="md">
         <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead>
               <Table.Tr>
                  <Table.Th>Classe</Table.Th>
                  <Table.Th>Matière</Table.Th>
                  <Table.Th>Enseignant</Table.Th>
                  <Table.Th>Volume</Table.Th>
                  <Table.Th>Action</Table.Th>
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((item: any) => (
                <Table.Tr key={item._id}>
                  <Table.Td fw={700}>
                    {item.classId?.name || "Classe inconnue"} 
                  </Table.Td>
                  <Table.Td>
                     <Badge variant="dot">
                       {item.subjectId?.name || "Matière inconnue"}
                     </Badge>
                  </Table.Td>
                  <Table.Td>
                    {item.teacherId?.name || "Non assigné"}
                  </Table.Td>
                  <Table.Td>{item.hoursPerWeek}h/sem</Table.Td>
                  <Table.Td>
                     <ActionIcon 
                       color="red" 
                       variant="subtle" 
                       onClick={() => handleDelete(item._id)} 
                     >
                       <IconTrash size={16} />
                     </ActionIcon>
                  </Table.Td>
                </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="dimmed" py="xl">Aucune attribution trouvée pour cette sélection</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
         </Table>
      </Paper>
    </Stack>
  );
}