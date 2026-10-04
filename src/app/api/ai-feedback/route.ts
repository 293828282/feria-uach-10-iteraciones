import { NextResponse } from 'next/server';

interface CriteriaItem {
  id: string;
  question_text: string;
  weight?: number;
}

// Academic Expert Heuristic Fallback Generator for UACh Sede Puerto Montt
function generateAcademicHeuristicFeedback(
  projectName: string,
  category: string,
  teamMembers: string,
  scores: Record<string, number>,
  criteria: CriteriaItem[],
  mode: 'feedback' | 'defense_questions' | 'swot_brief'
): string {
  const scoredItems = criteria.map((c) => ({
    title: c.question_text,
    score: scores[c.id] || 4.0,
    weight: c.weight || 1.0,
  }));

  const avg =
    scoredItems.length > 0
      ? scoredItems.reduce((acc, curr) => acc + curr.score, 0) / scoredItems.length
      : 5.0;

  const topCriteria = [...scoredItems].sort((a, b) => b.score - a.score)[0];
  const lowestCriteria = [...scoredItems].sort((a, b) => a.score - b.score)[0];

  if (mode === 'defense_questions') {
    return `Preguntas Técnicas de Defensa Directiva (Sede Puerto Montt):
1. Validación de Mercado y Tracción: Respecto a "${topCriteria?.title || 'la propuesta de valor'}", ¿qué evidencias empíricas o cartas de intención respaldan la disposición a pagar del segmento objetivo en la Región de Los Lagos?
2. Estructura de Costos y Factibilidad: Considerando la dimensión de "${lowestCriteria?.title || 'modelo de negocio'}", ¿cuál es el punto de equilibrio proyectado para el primer año de operación y cómo mitigan la volatilidad de insumos locales?
3. Escalabilidad y Ventaja Competitiva: ¿Qué barreras de entrada específicas protegen esta innovación frente a competidores establecidos en el sur de Chile?`;
  }

  if (mode === 'swot_brief') {
    return `Matriz Diagnóstica Estratégica (Comité Académico UACh Sede Puerto Montt):
1. Fortalezas Distintivas:
- Sólido desempeño en ${topCriteria?.title || 'planteamiento del problema'} (calificación promedio: ${topCriteria ? topCriteria.score.toFixed(1) : '6.0'}/7.0), evidenciando diferenciación clara.
- Articulación directiva coherente con las potencialidades de la industria y ecosistema de Puerto Montt.

2. Factores Críticos de Riesgo y Oportunidades:
- Requiere profundizar en ${lowestCriteria?.title || 'viabilidad financiera'} (evaluado con ${lowestCriteria ? lowestCriteria.score.toFixed(1) : '4.5'}/7.0) para asegurar tracción comercial y sostenibilidad operativa.
- Se aconseja robustecer la formalización del plan de canales de distribución y convenios territoriales.`;
  }

  // General feedback
  const tone =
    avg >= 5.8
      ? 'La propuesta presentada por el equipo demuestra un sobresaliente rigor conceptual, alta pertinencia territorial y una clara orientación a resolver desafíos estratégicos con alto potencial de impacto económico.'
      : avg >= 4.5
      ? 'El proyecto exhibe fundamentos metodológicos sólidos y un interesante potencial de desarrollo, presentando fortalezas claras en su planteamiento conceptual y pertinencia regional.'
      : 'La iniciativa identifica una oportunidad de interés; no obstante, requiere un refinamiento sustancial en su arquitectura técnica y matriz de validación antes de su escalamiento comercial.';

  return `Dictamen Académico Oficial (UACh Sede Puerto Montt):

${tone} Entre sus mayores virtudes destaca su desempeño en "${topCriteria?.title || 'desarrollo de la solución'}" (nota: ${topCriteria ? topCriteria.score.toFixed(1) : '6.0'}/7.0), reflejando un equipo de trabajo con capacidad ejecutiva y entendimiento del público usuario.

Para la siguiente etapa de maduración, el comité evaluador recomienda focalizar los esfuerzos en robustecer "${lowestCriteria?.title || 'sostenibilidad financiera'}" (nota: ${lowestCriteria ? lowestCriteria.score.toFixed(1) : '4.0'}/7.0), estableciendo métricas de conversión más rigurosas y blindando el flujo de caja operativo frente a contingencias macroeconómicas.`;
}

export async function POST(req: Request) {
  try {
    const { projectName, category, teamMembers, scores, criteria, mode = 'feedback' } = await req.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    // Build the academic prompt
    const breakdown = (criteria || [])
      .map((c: CriteriaItem) => {
        const score = scores?.[c.id];
        return `- ${c.question_text}: ${score ? score + ' / 7.0' : 'Pendiente'}`;
      })
      .join('\n');

    let modeInstruction = '';
    if (mode === 'defense_questions') {
      modeInstruction = `Formula con precisión 3 preguntas técnicas y de defensa directiva para que el panel de jueces plantee al equipo en su ronda de preguntas. Cada pregunta debe apuntar a la viabilidad financiera, validación de mercado o factibilidad técnica en la Región de Los Lagos.`;
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

    const prompt = `Actúa como un evaluador senior y consultor del comité académico de la Feria de Emprendimiento de la Universidad Austral de Chile (UACh) - Sede Puerto Montt.
Has evaluado al siguiente proyecto emprendedor:
- Nombre del Proyecto: ${projectName}
- Categoría: ${category}
- Equipo Emprendedor: ${teamMembers}
- Sede Académica: Sede Puerto Montt, Región de Los Lagos

Calificaciones por criterio (escala 1.0 a 7.0):
${breakdown}

${modeInstruction}

REGLA ESTRICTA OBLIGATORIA: Está terminantemente prohibido utilizar emojis, emoticones o caracteres informales. Redacción 100% sobria, directiva y formal para actas académicas de la Facultad de Ciencias Económicas y Administrativas y Escuela de Graduados de la UACh Sede Puerto Montt.`;

    // Candidate models in order of priority (verified active on Gemini v1beta)
    const candidateModels = [
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-lite-latest',
    ];

    if (apiKey) {
      for (const model of candidateModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: prompt }],
                  },
                ],
                generationConfig: {
                  temperature: 0.25,
                  maxOutputTokens: 750,
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              return NextResponse.json({ feedback: text, mode, source: `gemini-${model}` });
            }
          }
        } catch {}
      }
    }

    // High-caliber academic heuristic fallback if all API calls are busy or network fails
    const fallback = generateAcademicHeuristicFeedback(
      projectName || 'Proyecto Emprendedor',
      category || 'General',
      teamMembers || 'Equipo Estudiantil',
      scores || {},
      criteria || [],
      mode
    );

    return NextResponse.json({ feedback: fallback, mode, source: 'uach-heuristic-engine' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al procesar con IA.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
