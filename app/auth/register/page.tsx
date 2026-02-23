'use client';

import { useState, useEffect } from 'react';
import {
  Stepper,
  Center,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Paper,
  Container,
  Text,
  Box,
  ActionIcon,
  Tooltip,
  Anchor,
  useMantineColorScheme,
  useComputedColorScheme,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconSchool, 
  IconUserCheck, 
  IconShieldCheck, 
  IconSun, 
  IconMoon, 
  IconArrowLeft 
} from '@tabler/icons-react';
import Link from 'next/link';
import { notifications } from '@mantine/notifications'; 
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isMobile = useMediaQuery('(max-width: 48em)');
  const orientation = isMobile ? 'vertical' : 'horizontal';

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm({
    initialValues: {
      schoolName: '',
      schoolPhone: '',
      schoolEmail: '',
      adminName: '',
      adminPassword: '',
    },
    validate: (values) => {
      if (active === 0) {
        return {
          schoolName: values.schoolName.length < 3 ? 'Le nom est trop court' : null,
          schoolEmail: /^\S+@\S+$/.test(values.schoolEmail) ? null : 'Email invalide',
        };
      }
      if (active === 1) {
        return {
          adminName: values.adminName.length < 2 ? 'Nom requis' : null,
          adminPassword: values.adminPassword.length < 6 ? '6 caractères minimum' : null,
        };
      }
      return {};
    },
  });

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'inscription");

      notifications.show({
        title: 'Félicitations !',
        message: 'Votre école a été créée avec succès. Redirection...',
        color: 'green',
      });

      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      setActive((current) => (current < 2 ? current + 1 : current));
    }
  };
  
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  if (!mounted) return null;

  return (
    <Box 
      bg={computedColorScheme === 'light' ? 'linear-gradient(45deg, #EEF2FF 0%, #E0E7FF 100%)' : 'dark.8'}
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px 20px 20px',
      }}
    >
      <Tooltip label="Retour à l'accueil">
        <ActionIcon 
          component={Link} 
          href="/" 
          variant="white"
          size="lg"
          radius="xl"
          style={{ 
            position: 'fixed',
            top: rem(20), 
            left: rem(20), 
            zIndex: 100,
            boxShadow: 'var(--mantine-shadow-md)'
          }}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
      </Tooltip>

      <Container size={550} w="100%" px="xs">
        <Paper withBorder p={{ base: 'xl', sm: 45 }} radius="xl" style={{ backdropFilter: 'blur(10px)', boxShadow: 'var(--mantine-shadow-xl)' }}>
          <Group justify="space-between" mb={30}>
            <Text
              component="h2"
              fw={800}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              style={{ fontSize: 'var(--mantine-font-size-h2)', margin: 0 }}
            >
              Nouvel Établissement
            </Text>
            <ActionIcon 
              onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')} 
              variant="light" 
              size="lg"
            >
              {computedColorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
            </ActionIcon>
          </Group>

          <Stepper 
            active={active} 
            onStepClick={setActive} 
            allowNextStepsSelect={false} 
            orientation={orientation}
          >
            <Stepper.Step icon={<IconSchool size={rem(18)} />} label="École" description="Identité">
              <Box mt="xl">
                <TextInput label="Nom de l'établissement" placeholder="Ex: Lycée International" required {...form.getInputProps('schoolName')} />
                <TextInput mt="md" label="Numéro téléphone" placeholder="+261..." required {...form.getInputProps('schoolPhone')} />
                <TextInput mt="md" label="Email Officiel" placeholder="direction@ecole.com" required {...form.getInputProps('schoolEmail')} />
              </Box>
            </Stepper.Step>

            <Stepper.Step icon={<IconUserCheck size={rem(18)} />} label="Admin" description="Accès">
              <Box mt="xl">
                <TextInput label="Nom complet du Super-Admin" placeholder="Nom Prénom" required {...form.getInputProps('adminName')} />
                <PasswordInput mt="md" label="Mot de passe" placeholder="••••••••" required {...form.getInputProps('adminPassword')} />
              </Box>
            </Stepper.Step>

            <Stepper.Completed>
              <Center style={{ flexDirection: 'column' }} mt="xl" py="md">
                <IconShieldCheck size={60} color="var(--mantine-color-teal-6)" stroke={1.5} />
                <Text fw={700} size="lg" mt="md">Configuration prête !</Text>
                <Text c="dimmed" ta="center" size="sm" maw={300}>
                  Cliquez sur le bouton ci-dessous pour finaliser la création de votre espace scolaire.
                </Text>
              </Center>
            </Stepper.Completed>
          </Stepper>

          <Group justify="center" mt={40}>
            {active !== 0 && (
              <Button variant="light" color="gray" onClick={prevStep}>
                Retour
              </Button>
            )}
            
            {active < 2 ? (
              <Button onClick={nextStep} px={30} radius="md">
                Étape Suivante
              </Button>
            ) : (
              <Button color="green" fullWidth radius="md" size="md" loading={loading} onClick={handleFinalSubmit}>
                Confirmer et Créer l'Espace
              </Button>
            )}
          </Group>

          {active === 0 && (
            <Text ta="center" mt="md" size="sm" c="dimmed">
              Déjà inscrit ?{' '}
              <Anchor component={Link} href="/auth/login" fw={700}>
                Se connecter
              </Anchor>
            </Text>
          )}
        </Paper>
      </Container>
    </Box>
  );
}




// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   Stepper,
//   Center,
//   Button,
//   Group,
//   TextInput,
//   PasswordInput,
//   Paper,
//   Title,
//   Container,
//   Text,
//   Box,
//   ActionIcon,
//   Tooltip,
//   Anchor,
//   useMantineColorScheme,
//   useComputedColorScheme,
//   rem,
// } from '@mantine/core';
// import { useForm } from '@mantine/form';
// import { 
//   IconSchool, 
//   IconUserCheck, 
//   IconShieldCheck, 
//   IconSun, 
//   IconMoon, 
//   IconArrowLeft 
// } from '@tabler/icons-react';
// import Link from 'next/link';
// import { notifications } from '@mantine/notifications'; 
// import { useRouter } from 'next/navigation';

// export default function RegisterPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const [mounted, setMounted] = useState(false);
//   const [active, setActive] = useState(0);
//   const { setColorScheme } = useMantineColorScheme();
//   const computedColorScheme = useComputedColorScheme('light');

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const form = useForm({
//     initialValues: {
//       schoolName: '',
//       schoolPhone: '',
//       schoolEmail: '',
//       adminName: '',
//       adminPassword: '',
//     },
//     validate: (values) => {
//       if (active === 0) {
//         return {
//           schoolName: values.schoolName.length < 3 ? 'Le nom est trop court' : null,
//           schoolEmail: /^\S+@\S+$/.test(values.schoolEmail) ? null : 'Email invalide',
//         };
//       }
//       if (active === 1) {
//         return {
//           adminName: values.adminName.length < 2 ? 'Nom requis' : null,
//           adminPassword: values.adminPassword.length < 6 ? '6 caractères minimum' : null,
//         };
//       }
//       return {};
//     },
//   });

//   const handleFinalSubmit = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form.values),
//       });

//       const data = await response.json();

//       if (!response.ok) throw new Error(data.error || "Erreur lors de l'inscription");

//       notifications.show({
//         title: 'Félicitations !',
//         message: 'Votre école a été créée avec succès. Redirection...',
//         color: 'green',
//       });

//       // Redirection vers le login après 2 secondes
//       setTimeout(() => router.push('/auth/login'), 2000);
//     } catch (error: any) {
//       notifications.show({
//         title: 'Erreur',
//         message: error.message,
//         color: 'red',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nextStep = () => setActive((current) => (form.validate().hasErrors ? current : current + 1));
//   const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

//   if (!mounted) {
//     return <div style={{ minHeight: '100vh', background: '#f5f7fa' }} />;
//   }

//   return (
//     <Box style={{ 
//         minHeight: '100vh', 
//         display: 'flex', 
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         padding: '60px 20px 20px 20px',
//         background: computedColorScheme === 'light' 
//           ? 'linear-gradient(45deg, #EEF2FF 0%, #E0E7FF 100%)' 
//           : '#101113' 
//       }}>
      
//       {/* BOUTON RETOUR ACCUEIL */}
      
//       <Tooltip label="Retour à l'accueil">
//         <ActionIcon 
//           component={Link} 
//           href="/" 
//           variant="white"
//           size="lg"
//           radius="xl"
//           style={{ 
//             position: 'fixed',
//             top: rem(20), 
//             left: rem(20), 
//             zIndex: 100,
//             boxShadow: 'var(--mantine-shadow-md)'
//           }}
//         >
//           <IconArrowLeft size={20} />
//         </ActionIcon>
//       </Tooltip>

//       <Container size={550} w="100%" px="xs">
//         <Paper withBorder p={{ base: 'xl', sm: 45 }} radius="xl" style={{ backdropFilter: 'blur(10px)', boxShadow: 'var(--mantine-shadow-xl)' }}>
//           <Group justify="space-between" mb={30}>
            
//             <Text
//               component="h2"
//               size="xl"
//               fw={800}
//               variant="gradient"
//               gradient={{ from: 'blue', to: 'cyan' }}
//               style={{ fontSize: 'var(--mantine-font-size-h2)' }}
//             >
//               Nouvel Établissement
//             </Text>
//             <ActionIcon onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')} variant="light" size="lg">
//               {computedColorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
//             </ActionIcon>
//           </Group>

//           <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} orientation={{ base: 'vertical', sm: 'horizontal' }}>
//             <Stepper.Step icon={<IconSchool size={rem(18)} />} label="École" description="Identité">
//               <Box mt="xl">
//                 <TextInput 
//                   label="Nom de l'établissement" 
//                   placeholder="Ex: Lycée International" 
//                   required 
//                   {...form.getInputProps('schoolName')} 
//                 />
//                 <TextInput 
//                   mt="md" 
//                   label="Numéro téléphone" 
//                   placeholder="+261..." 
//                   required 
//                   {...form.getInputProps('schoolPhone')} 
//                 />
//                 <TextInput 
//                   mt="md" 
//                   label="Email Officiel" 
//                   placeholder="direction@ecole.com" 
//                   required 
//                   {...form.getInputProps('schoolEmail')} 
//                 />
//               </Box>
//             </Stepper.Step>

//             <Stepper.Step icon={<IconUserCheck size={rem(18)} />} label="Admin" description="Accès">
//               <Box mt="xl">
//                 <TextInput 
//                   label="Nom complet du Super-Admin" 
//                   placeholder="Mamadou Traoré" 
//                   required 
//                   {...form.getInputProps('adminName')} 
//                 />
//                 <PasswordInput 
//                   mt="md" 
//                   label="Mot de passe" 
//                   placeholder="••••••••" 
//                   required 
//                   {...form.getInputProps('adminPassword')} 
//                 />
//               </Box>
//             </Stepper.Step>

//             <Stepper.Completed>
//               <Center style={{ flexDirection: 'column' }} mt="xl" py="md">
//                 <IconShieldCheck size={60} color="var(--mantine-color-teal-6)" stroke={1.5} />
//                 <Text fw={700} size="lg" mt="md">Configuration prête !</Text>
//                 <Text c="dimmed" ta="center" size="sm" maw={300}>
//                   Cliquez sur le bouton ci-dessous pour finaliser la création de votre espace scolaire.
//                 </Text>
//               </Center>
//             </Stepper.Completed>
//           </Stepper>

//           <Group justify="center" mt={40}>
//             {active !== 0 && active < 2 && (
//               <Button variant="light" color="gray" onClick={prevStep}>
//                 Retour
//               </Button>
//             )}
            
//             {active < 2 ? (
//               <Button onClick={nextStep} px={30} radius="md">
//                 Étape Suivante
//               </Button>
//             ) : (
//               <Button color="green" fullWidth radius="md" size="md" 
//               loading={loading}
//               onClick={handleFinalSubmit}>
//                 Confirmer et Créer l'Espace
//               </Button>
//             )}
//           </Group>

//           {active === 0 && (
//             <Text ta="center" mt="md" size="sm" c="dimmed">
//               Déjà inscrit ?{' '}
//               <Anchor component={Link} href="/auth/login" fw={700}>
//                 Se connecter
//               </Anchor>
//             </Text>
//           )}
//         </Paper>
//       </Container>
//     </Box>
//   );
// }