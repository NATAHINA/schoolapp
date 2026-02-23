import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/dates/styles.css';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';

dayjs.locale('fr');

export const metadata = {
  title: 'EduManager',
  description: 'Application de gestion multi-écoles',
}

export default function RootLayout({ children }: { children: any}){
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <ModalsProvider>
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}



