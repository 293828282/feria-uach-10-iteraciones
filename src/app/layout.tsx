import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CelestialAuroraCanvas } from '@/components/CelestialAuroraCanvas';

export const metadata: Metadata = {
  metadataBase: new URL('https://feria-uach-10-iteraciones.vercel.app'),
  title: {
    default: 'Feria de Emprendimiento UACh 2026 | Sistema Oficial de Evaluación',
    template: '%s | Feria UACh 2026',
  },
  description:
    'Plataforma institucional para la evaluación en tiempo real de stands y proyectos de emprendimiento. Universidad Austral de Chile • Sede Puerto Montt, Región de Los Lagos.',
  applicationName: 'Feria Emprendimiento UACh 2026',
  authors: [{ name: 'Universidad Austral de Chile - Sede Puerto Montt' }],
  creator: 'Universidad Austral de Chile',
  publisher: 'Escuela de Graduados - FACEA UACh',
  keywords: [
    'UACh',
    'Universidad Austral de Chile',
    'Feria de Emprendimiento',
    'Puerto Montt',
    'Evaluación de Jurados',
    'Innovación',
    'FACEA',
    'Podio Oficial',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://feria-uach-10-iteraciones.vercel.app',
    siteName: 'Universidad Austral de Chile • Sede Puerto Montt',
    title: 'Feria de Emprendimiento UACh 2026 | Sistema Oficial de Evaluación',
    description:
      'Pauta oficial de jurados, catálogo interactivo de stands y determinación algorítmica del podio de ganadores. Sede Puerto Montt.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feria de Emprendimiento UACh 2026 | Sistema Oficial de Evaluación',
    description:
      'Pauta oficial de jurados, catálogo interactivo de stands y podio de ganadores • Universidad Austral de Chile, Sede Puerto Montt.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#dff0fe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased selection:bg-sky-200 selection:text-sky-900 relative min-h-screen bg-[#dff0fe] text-slate-900 overflow-x-hidden">
        <CelestialAuroraCanvas />
        <div className="relative z-10 min-h-screen flex flex-col justify-between">
          {children}
        </div>
      </body>
    </html>
  );
}
