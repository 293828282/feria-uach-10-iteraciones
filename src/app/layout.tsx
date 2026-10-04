import './globals.css';
import type { Metadata } from 'next';
import { CelestialAuroraCanvas } from '@/components/CelestialAuroraCanvas';

export const metadata: Metadata = {
  title: 'Feria de Emprendimiento UACh 2026 | Plataforma de Evaluación',
  description: 'Sistema institucional para la evaluación en tiempo real de stands y proyectos de emprendimiento en la Universidad Austral de Chile.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-sky-200 selection:text-sky-900 relative">
        <CelestialAuroraCanvas />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
