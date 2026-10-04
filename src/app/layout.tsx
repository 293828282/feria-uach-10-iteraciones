import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CelestialAuroraCanvas } from '@/components/CelestialAuroraCanvas';

export const metadata: Metadata = {
  title: 'Feria de Emprendimiento UACh 2026 | Plataforma de Evaluación',
  description: 'Sistema institucional para la evaluación en tiempo real de stands y proyectos de emprendimiento en la Universidad Austral de Chile.',
  icons: {
    icon: '/uach-logo.webp',
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
