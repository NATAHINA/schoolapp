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

type DashboardOnboardingProps = {
  role: string;
  menuLabels: string[];
  onHelpReady?: (open: () => void) => void;
};

export function DashboardOnboarding({
  role,
  menuLabels,
  onHelpReady,
}: DashboardOnboardingProps) {
  const [opened, setOpened] = useState(() =>
    typeof window !== 'undefined' &&
    localStorage.getItem(`dashboard_onboarding_seen_${role}`) !== 'true'
  );
  const [active, setActive] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: 'Bienvenue dans votre espace',
      description:
        'Ce rapide parcours vous présente l’organisation des menus et des sous-menus disponibles pour votre rôle.',
      icon: IconHelp,
    },
    {
      title: 'Menu principal',
      description:
        menuLabels.length > 0
          ? `Utilisez la barre latérale pour accéder à : ${menuLabels.join(', ')}. Les rubriques contenant une flèche regroupent des sous-menus.`
          : 'Utilisez la barre latérale pour accéder aux fonctionnalités disponibles pour votre rôle.',
      icon: IconMenu2,
    },
    {
      title: 'Sous-menus et paramètres',
      description:
        'Ouvrez une rubrique pour afficher ses sous-menus. Les paramètres regroupent la configuration de votre établissement, des classes, des matières et des utilisateurs.',
      icon: IconSettings,
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
          <Button
            rightSection={
              active === steps.length - 1 ? <IconCheck size={16} /> : <IconArrowRight size={16} />
            }
            onClick={next}
          >
            {active === steps.length - 1 ? 'Commencer' : 'Suivant'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
