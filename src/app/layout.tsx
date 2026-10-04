import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CelestialAuroraCanvas } from '@/components/CelestialAuroraCanvas';

export const metadata: Metadata = {
  metadataBase: new URL('https://feria-uach-10-iteraciones.vercel.app'),
  title: 'Feria de Emprendimiento UACh 2026',
  description:
    'Pauta oficial de jurados y catálogo de stands. Universidad Austral de Chile - Sede Puerto Montt.',
  applicationName: 'Feria UACh 2026',
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
    siteName: 'Universidad Austral de Chile',
    title: 'Feria de Emprendimiento UACh 2026',
    description:
      'Pauta oficial de jurados y catálogo de stands. Universidad Austral de Chile - Sede Puerto Montt.',
    images: [
      {
        url: '/og-image.png?v=4',
        width: 1200,
        height: 630,
        alt: 'Feria de Emprendimiento UACh 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feria de Emprendimiento UACh 2026',
    description:
      'Pauta oficial de jurados y catálogo de stands. Universidad Austral de Chile - Sede Puerto Montt.',
    images: ['/og-image.png?v=4'],
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
