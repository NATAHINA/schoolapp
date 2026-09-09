'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconHelp,
  IconMenu2,
  IconSettings,
} from '@tabler/icons-react';

type OnboardingStep = {
  title: string;
  description: string;
  icon: typeof IconMenu2;
};

export type OnboardingMenuItem = {
  label: string;
  children?: string[];
};

type DashboardOnboardingProps = {
  role: string;
  menuItems: OnboardingMenuItem[];
  onHelpReady?: (open: () => void) => void;
};

export function DashboardOnboarding({
  role,
  menuItems,
  onHelpReady,
}: DashboardOnboardingProps) {
  const [opened, setOpened] = useState(() =>
    typeof window !== 'undefined' &&
    localStorage.getItem(`dashboard_onboarding_seen_${role}`) !== 'true'
  );
  const [active, setActive] = useState(0);

  const menuDescription = (label: string) => {
    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel.includes('dashboard') || normalizedLabel.includes('accueil') || normalizedLabel.includes('ensemble')) {
      return 'Consultez une vue synthétique de l’activité de votre établissement et de ses indicateurs principaux.';
    }
    if (normalizedLabel.includes('élève') || normalizedLabel.includes('enfant')) {
      return 'Gérez les dossiers, les informations et le suivi des élèves concernés par votre rôle.';
    }
    if (normalizedLabel.includes('parent')) {
      return 'Consultez et gérez les informations relatives aux parents et aux responsables des élèves.';
    }
    if (normalizedLabel.includes('prof')) {
      return 'Gérez les professeurs, leurs affectations et le suivi de leur présence.';
    }
    if (normalizedLabel.includes('paiement') || normalizedLabel.includes('caisse') || normalizedLabel.includes('écolage')) {
      return 'Suivez les paiements et les informations financières de l’établissement.';
    }
    if (normalizedLabel.includes('scolarité') || normalizedLabel.includes('note') || normalizedLabel.includes('rapport')) {
      return 'Consultez les notes, les bulletins et les rapports liés à la scolarité.';
    }
    if (normalizedLabel.includes('assiduité') || normalizedLabel.includes('appel') || normalizedLabel.includes('présence')) {
      return 'Suivez les présences, les absences et les retards des élèves ou des professeurs.';
    }
    if (normalizedLabel.includes('paramètre')) {
      return 'Configurez les éléments de l’établissement : année scolaire, classes, matières, tarifs et utilisateurs.';
    }
    if (normalizedLabel.includes('à propos')) {
      return 'Découvrez les informations et les fonctionnalités principales de SchoolApp.';
    }

    return 'Accédez aux fonctionnalités disponibles dans cette rubrique.';
  };

  const steps: OnboardingStep[] = [
    {
      title: 'Bienvenue dans votre espace',
      description:
        'Ce parcours vous présente les menus disponibles pour votre rôle et explique à quoi sert chaque rubrique.',
      icon: IconHelp,
    },
    ...menuItems.map((item, index) => ({
      title: `${index + 1}. ${item.label}`,
      description: `${menuDescription(item.label)}${
        item.children && item.children.length > 0
          ? ` Sous-menus : ${item.children.join(', ')}.`
          : ''
      }`,
      icon: item.children && item.children.length > 0 ? IconSettings : IconMenu2,
    })),
    {
      title: 'Vous êtes prêt !',
      description:
        'Utilisez la barre latérale pour naviguer dans l’application. Vous pouvez rouvrir ce guide à tout moment avec le bouton d’aide en haut de l’écran.',
      icon: IconCheck,
    },
  ];

  const open = () => {
    setActive(0);
    setOpened(true);
  };

  useEffect(() => {
    onHelpReady?.(open);
  }, [onHelpReady]);

  const close = () => {
    localStorage.setItem(`dashboard_onboarding_seen_${role}`, 'true');
    setOpened(false);
  };

  const next = () => {
    if (active === steps.length - 1) {
      close();
      return;
    }
    setActive((current) => current + 1);
  };

  const step = steps[active];
  const StepIcon = step.icon;

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Prise en main"
      centered
      size="md"
      closeOnClickOutside={false}
    >
      <Stack gap="lg">
        <Progress value={((active + 1) / steps.length) * 100} size="sm" />
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon size={44} radius="xl" variant="light" color="teal">
            <StepIcon size={24} />
          </ThemeIcon>
          <Stack gap={4}>
            <Title order={4}>{step.title}</Title>
            <Text c="dimmed" size="sm">
              {step.description}
            </Text>
          </Stack>
        </Group>
        <Group justify="space-between">
          <Button variant="subtle" color="gray" onClick={close}>
            Passer
          </Button>
          <Group gap="xs">
            {active > 0 && (
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => setActive((current) => current - 1)}>
                Précédent
              </Button>
            )}
            <Button
              rightSection={
                active === steps.length - 1 ? <IconCheck size={16} /> : <IconArrowRight size={16} />
              }
              onClick={next}
            >
              {active === steps.length - 1 ? 'Commencer' : 'Suivant'}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
