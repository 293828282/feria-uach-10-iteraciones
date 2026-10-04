import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Feria de Emprendimiento UACh 2026 | Sistema Oficial de Evaluación';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          background: 'linear-gradient(135deg, #07192f 0%, #0d3257 50%, #061527 100%)',
          color: '#ffffff',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '200px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.20) 0%, transparent 70%)',
          }}
        />

        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Crest Emblem */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: '2px solid #38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 'bold',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
              }}
            >
              UACh
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  color: '#f59e0b',
                  textTransform: 'uppercase',
                }}
              >
                Universidad Austral de Chile
              </span>
              <span style={{ fontSize: '15px', color: '#94a3b8' }}>
                Facultad de Ciencias Económicas y Administrativas &bull; Sede Puerto Montt
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '15px',
              color: '#38bdf8',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            CERTAMEN 2026
          </div>
        </div>

        {/* Main Center Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '950px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#38bdf8',
              fontSize: '16px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            Pauta Oficial de Jurados &bull; Podio de Ganadores
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              lineHeight: 1.12,
              margin: 0,
              background: 'linear-gradient(to right, #ffffff, #e0f2fe, #bae6fd)',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.5)',
            }}
          >
            Feria de Emprendimiento e Innovación UACh
          </h1>

          <p
            style={{
              fontSize: '21px',
              lineHeight: 1.4,
              color: '#cbd5e1',
              margin: 0,
            }}
          >
            Sistema digital de evaluación para el cuerpo evaluador, catálogo interactivo de stands y determinación algorítmica de proyectos ganadores en la Región de Los Lagos.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '14px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '15px',
              color: '#7dd3fc',
              fontWeight: '600',
            }}
          >
            Pauta Oficial 7 Criterios
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '14px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              fontSize: '15px',
              color: '#d8b4fe',
              fontWeight: '600',
            }}
          >
            Asistencia IA para el Jurado
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '14px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '15px',
              color: '#fcd34d',
              fontWeight: '600',
            }}
          >
            Podio Oficial &bull; Sede Puerto Montt
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
