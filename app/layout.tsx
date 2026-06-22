import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Agenda Profissional',
  description: 'Agenda, tarefas, calendário e lembretes com Supabase',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Agenda Pro',
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b4fd8'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
