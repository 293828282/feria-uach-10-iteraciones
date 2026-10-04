import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { projectName, category, teamMembers, scores, criteria, mode = 'feedback' } = await req.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY no está configurada en las variables de entorno.' },
        { status: 500 }
      );
    }

    const breakdown = criteria
      .map((c: { id: string; question_text: string }) => {
        const score = scores[c.id];
        return `- ${c.question_text}: ${score ? score + ' / 7.0' : 'Pendiente'}`;
      })
      .join('\n');

    let modeInstruction = '';
    if (mode === 'defense_questions') {
      modeInstruction = `Formula con precisión 3 preguntas técnicas y de defensa directiva para que el panel de jueces plantee al equipo en su ronda de preguntas. Cada pregunta debe apuntar a la viabilidad financiera, validación de mercado o factibilidad técnica, considerando sus calificaciones.`;
    } else if (mode === 'swot_brief') {
      modeInstruction = `Elabora una matriz diagnóstica concisa estructurada en:
1. Fortalezas Distintivas: 2 aspectos sobresalientes del proyecto.
2. Factores de Riesgo / Oportunidades de Mejora: 2 puntos críticos a robustecer para asegurar su sostenibilidad económica.`;
    } else {
      modeInstruction = `Genera una devolución de retroalimentación cualitativa ejecutiva, formal y pedagógica (2 párrafos compactos y contundentes).
Debe destacar:
1. Las principales fortalezas competitivas y conceptuales demostradas en la propuesta.
2. Recomendaciones críticas y viables para potenciar su tracción de mercado, escalabilidad y solidez técnica/financiera.`;
    }

    const prompt = `Actúa como un evaluador senior y consultor del comité académico de la Feria de Emprendimiento de la Universidad Austral de Chile (UACh).
Has evaluado al siguiente proyecto emprendedor:
- Nombre del Proyecto: ${projectName}
- Categoría: ${category}
- Equipo Emprendedor: ${teamMembers}

Calificaciones por criterio (escala 1.0 a 7.0):
${breakdown}

${modeInstruction}

REGLA ESTRICTA OBLIGATORIA: Está terminantemente prohibido utilizar emojis, emoticones o caracteres informales. Redacción 100% sobria, directiva y formal para actas académicas de la Escuela de Graduados y Facultad de Ciencias Económicas y Administrativas de la UACh.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    if (!response.ok) {
      // Fallback to gemini-2.5-flash or 2.0-flash if needed
      const response2 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.25, maxOutputTokens: 700 },
          }),
        }
      );

      if (!response2.ok) {
        const errText = await response2.text();
        return NextResponse.json(
          { error: `Error desde Gemini API: ${response2.status} - ${errText}` },
          { status: response2.status }
        );
      }

      const data2 = await response2.json();
      const feedbackText2 = data2.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      return NextResponse.json({ feedback: feedbackText2, mode });
    }

    const data = await response.json();
    const generatedFeedback =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'No se pudo sintetizar la retroalimentación cualitativa.';

    return NextResponse.json({ feedback: generatedFeedback, mode });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al procesar con IA.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
