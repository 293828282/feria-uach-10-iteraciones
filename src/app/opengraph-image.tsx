import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Feria de Emprendimiento UACh 2026';
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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Subtle decorative framing */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: '2px solid #e2e8f0',
            borderRadius: 24,
          }}
        />

        {/* Central emblem and typography - perfectly centered for 1:1 and 16:9 previews */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: 780,
          }}
        >
          {/* Crisp Vector Crest of Universidad Austral de Chile */}
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 44,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%)',
              border: '4px solid #38bdf8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 22,
              boxShadow: '0 12px 35px rgba(2, 132, 199, 0.3)',
            }}
          >
            <span
              style={{
                fontFamily: 'serif',
                fontSize: 54,
                fontWeight: 'bold',
                color: '#ffffff',
                letterSpacing: 2,
              }}
            >
              UACh
            </span>
            <div
              style={{
                width: 44,
                height: 4,
                backgroundColor: '#f59e0b',
                marginTop: 4,
                borderRadius: 2,
              }}
            />
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#0369a1',
              letterSpacing: 3,
              textTransform: 'uppercase',
              fontFamily: 'serif',
              marginBottom: 8,
            }}
          >
            Universidad Austral de Chile
          </div>

          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              color: '#0f172a',
              fontFamily: 'serif',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Feria de Emprendimiento 2026
          </div>

          <div
            style={{
              fontSize: 24,
              color: '#475569',
              fontFamily: 'serif',
              fontWeight: 600,
            }}
          >
            Sede Puerto Montt &bull; Evaluación de Jurados
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
