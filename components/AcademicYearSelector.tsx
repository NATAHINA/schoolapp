'use client';
import { Select, Group, Text, Loader } from '@mantine/core';
import { useEffect, useState } from 'react';

export function AcademicYearSelector() {
  const [annees, setAnnees] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(localStorage.getItem('active_annee_id'));

  useEffect(() => {
    const fetchAnnees = async () => {
      const schoolId = localStorage.getItem('school_id');
      if (!schoolId) return;

      try {
        const res = await fetch(`/api/settings/annee?schoolId=${schoolId}`);
        const data = await res.json();

        if (data && Array.isArray(data)) {
          const formatted = data.map((y: any) => ({
            value: y._id,
            label: y.name
          }));
          setAnnees(formatted);

          const current = data.find((y: any) => y.isCurrent);

          if (current && !localStorage.getItem('active_annee_id')) {
            localStorage.setItem('active_annee_id', current._id);
            setSelected(current._id); 
          }

        } else {
          console.error("L'API n'a pas renvoyé un tableau :", data);
          setAnnees([]);
        }
      } catch (error) {
        console.error("Erreur fetch annees:", error);
        setAnnees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnees();
  }, []);

  const handleChange = (id: string | null) => {
    if (id) {
      localStorage.setItem('active_annee_id', id);
      setSelected(id);
      window.location.reload();
    }
  };

  if (loading) return <Loader size="xs" />;

  return (
    <Group gap="xs">
      <Text fz="xs" fw={700}>ANNÉE :</Text>
      <Select
        size="xs"
        data={annees}
        value={selected}
        onChange={handleChange}
        allowDeselect={false}
        style={{ width: 130 }}
      />
    </Group>
  );
}