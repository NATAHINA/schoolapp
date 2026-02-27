

'use client';

import { useState, useEffect } from 'react';
import {
  AppShell, Burger, Group, NavLink, Title, ActionIcon, Text,
  useMantineColorScheme, useComputedColorScheme, rem, ScrollArea,
  Menu, Avatar, UnstyledButton, Box, Stack, Flex
} from '@mantine/core';
import { 
  IconDashboard, IconUsers, IconSchool, IconChartBar, IconSettings,
  IconSun, IconMoon, IconLogout, IconUsersGroup, IconBellRinging,IconSettingsDollar,
  IconBooks, IconHierarchy2, IconCalendarEvent, IconUser, IconAffiliate, IconBackpack,
  IconClockCheck, IconMenu4, IconChartDots, IconChecklist, IconFileDescription, 
  IconCash, IconInfoCircle, IconUserCog
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { AcademicYearSelector } from '@/components/AcademicYearSelector';

// --- CONFIGURATION DES MENUS PAR RÔLE ---
const menus = {
  ADMIN: [
    { link: '/dashboard', label: 'Vue d\'ensemble', icon: IconDashboard },
    {
      label: 'Élèves', 
      icon: IconUsersGroup,
      links: [
        { link: '/dashboard/students', label: 'Listes', icon: IconMenu4 },
        { link: '/dashboard/attendance', label: "Faire l'appel", icon: IconBellRinging },
      ]
    },
    { link: '/dashboard/parents', label: 'Parents', icon: IconUsers },
    {
      label: 'Professeurs', 
      icon: IconSchool,
      links: [
        { link: '/dashboard/teachers', label: 'Listes', icon: IconMenu4 },
        { link: '/dashboard/settings/assignements', label: 'Assignements', icon: IconAffiliate },
        { link: '/dashboard/teachers/attendance', label: 'Présence', icon: IconClockCheck },
        { link: '/dashboard/teachers/attendance/stats', label: 'Statistique', icon: IconChartDots },
      ]
    },
    { link: '/dashboard/payments', label: 'Paiements', icon: IconCash },
    {
      label: 'Rapports & Notes', 
      icon: IconChartBar,
      links: [
        { link: '/dashboard/grades', label: 'Notes', icon: IconChecklist },
        { link: '/dashboard/reports', label: "Rapports", icon: IconFileDescription },
      ]
    },
    { 
      label: 'Paramètres', 
      icon: IconSettings,
      links: [
        { link: '/dashboard/settings/general', label: 'Général', icon: IconSettings },
        { link: '/dashboard/settings/annees', label: 'Année Scolaire', icon: IconCalendarEvent },
        { link: '/dashboard/settings/classes', label: 'Classes', icon: IconHierarchy2 },
        { link: '/dashboard/settings/fees', label: 'Grille tarifaire', icon: IconSettingsDollar },
        { link: '/dashboard/settings/subjects', label: 'Matières', icon: IconBooks },
        { link: '/dashboard/settings/users', label: 'Utilisateurs', icon: IconUserCog },
      ]
    },
    { link: '/dashboard/about', label: 'À propos', icon: IconInfoCircle },
  ],
  PARENT: [
    { link: '/dashboard/parent', label: 'Mes Enfants', icon: IconUsersGroup },
    { link: '/dashboard/parent/payements', label: 'Paiements', icon: IconCash },
    { link: '/dashboard/parent/attendance', label: 'Assiduité', icon: IconBellRinging },
    { link: '/dashboard/parent/grades', label: 'Notes & Bulletins', icon: IconChartBar },
  ],
  SECRETARY: [
    { link: '/dashboard', label: 'Accueil', icon: IconDashboard },
    {
      label: 'Gestion Élèves', 
      icon: IconUsersGroup,
      links: [
        { link: '/dashboard/students', label: 'Listes des élèves', icon: IconMenu4 },
        { link: '/dashboard/parents', label: 'Dossiers Parents', icon: IconUsers },
        { link: '/dashboard/attendance', label: "Faire l'appel", icon: IconBellRinging },
      ]
    },
    {
      label: 'Scolarité', 
      icon: IconChartBar,
      links: [
        { link: '/dashboard/grades', label: 'Notes', icon: IconChecklist },
        { link: '/dashboard/reports', label: "Bulletins", icon: IconFileDescription },
      ]
    },
  ],

  ACCOUNTANT: [
    { link: '/dashboard', label: 'Tableau de bord', icon: IconDashboard },
    { link: '/dashboard/payments', label: 'Caisse & Écolages', icon: IconCash },
    { link: '/dashboard/students', label: 'Liste Élèves', icon: IconUsersGroup },
    { link: '/dashboard/settings/fees', label: 'Grille tarifaire', icon: IconSettingsDollar },
  ],

  SURVEILLANT: [
    { link: '/dashboard', label: 'Vue d\'ensemble', icon: IconDashboard },
    { link: '/dashboard/attendance', label: "Appel & Retards", icon: IconBellRinging },
    { link: '/dashboard/students', label: 'Recherche Élève', icon: IconUsersGroup },
    { link: '/dashboard/teachers/attendance', label: 'Présence Profs', icon: IconClockCheck },
  ],
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [schoolData, setSchoolData] = useState<{name: string, logo: string} | null>(null);
  const [userRole, setUserRole] = useState<string>('ADMIN');
  const [user, setUser] = useState({ name: 'Utilisateur', initials: 'U' });
  
  const pathname = usePathname();
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  useEffect(() => {
    setOpened(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('user_role') || 'ADMIN';
    const name = localStorage.getItem('user_name') || 'Utilisateur';
    const schoolId = localStorage.getItem('school_id');

    setUserRole(role);
    setUser({ name, initials: name.substring(0, 2).toUpperCase() });

    // Récupérer le logo de l'école
    if (schoolId) {
      fetch(`/api/settings/general?schoolId=${schoolId}`)
        .then(res => res.json())
        .then(data => setSchoolData(data))
        .catch(() => console.error("Erreur chargement logo"));
    }
  }, []);

  useEffect(() => {
    const schoolId = localStorage.getItem('school_id');
    if (schoolId) {
      fetch(`/api/settings/general?schoolId=${schoolId}`)
        .then(res => res.json())
        .then(data => setSchoolData(data));
    }

    const handleSchoolUpdate = (event: any) => {
      setSchoolData({
        name: event.detail.name,
        logo: event.detail.logo
      });
    };

    window.addEventListener('schoolUpdate', handleSchoolUpdate);
    
    return () => window.removeEventListener('schoolUpdate', handleSchoolUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    notifications.show({ title: 'Déconnexion', message: 'À bientôt !', color: 'blue' });
    router.push('/auth/login');
  };

  const renderNavLinks = (data: any[]) => {
    return data.map((item) => {
      if (item.links) {
        return (
          <NavLink
            key={item.label}
            label={item.label}
            leftSection={<item.icon size="1.2rem" stroke={1.5} />}
            childrenOffset={28}
            defaultOpened={pathname.includes('/settings')}
          >
            {item.links.map((sub: any) => (
              <NavLink 
                key={sub.label} 
                component={Link} 
                href={sub.link} 
                label={sub.label} 
                active={pathname === sub.link}
                leftSection={<sub.icon size="1.1rem" stroke={1.5} />}
              />
            ))}
          </NavLink>
        );
      }
      return (
        <NavLink
          key={item.label}
          component={Link}
          href={item.link}
          label={item.label}
          leftSection={<item.icon size="1.2rem" stroke={1.5} />}
          active={pathname === item.link}
          variant="light"
          style={{ borderRadius: rem(8), marginBottom: rem(4) }}
        />
      );
    });
  };

  if (!mounted) return null;

  return (
    <AppShell
      header={{ height: { base: 60, md: 70 } }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={{ base: 'xs', sm: 'md' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group wrap="nowrap" gap="xs">
            <Burger opened={opened} onClick={() => setOpened(!opened)} hiddenFrom="sm" size="sm" />
            <Group wrap="nowrap" gap="xs">
              <Avatar src={schoolData?.logo} size="md" radius="sm" color="teal">
                <IconBackpack size={20} />
              </Avatar>


              <Title order={3} fz={{base:14, sm: 18}} fw={800} c="teal.7" lineClamp={1}>
                {schoolData?.name || 'EduManager'}
              </Title>
            </Group>
          </Group>

          <Flex gap={{ base: 5, sm: 10 }} align="center" wrap="nowrap">
             <Box visibleFrom="xs">
               <AcademicYearSelector />
             </Box>

            <ActionIcon onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')} variant="default" size={{ base: 'md', sm: 'lg' } as any}>
              {computedColorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
            </ActionIcon>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Avatar color="teal" radius="xl" size="md">{user.initials}</Avatar>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{user.name} ({userRole})</Menu.Label>
                <Box hiddenFrom="xs" p="xs">
                   <AcademicYearSelector />
                </Box>
                <Menu.Divider />
                <Menu.Item leftSection={<IconUser size={14} />} component={Link} href="/dashboard/settings/profile">Profil</Menu.Item>
                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>Déconnexion</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap={4}>
            {renderNavLinks(menus[userRole as keyof typeof menus] || menus.ADMIN)}
          </Stack>
        </AppShell.Section>

        <AppShell.Section hiddenFrom="sm" pt="md" style={{ borderTop: '1px solid #eee' }}>
           <NavLink 
             label="Déconnexion" 
             leftSection={<IconLogout size="1.2rem" />} 
             color="red" 
             onClick={handleLogout}
           />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main bg={computedColorScheme === 'light' ? 'gray.0' : 'dark.8'}>
        
        <Box style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}