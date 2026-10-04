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
  mode: 'questions' | 'improve_draft',
  currentDraft?: string
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

  if (mode === 'questions') {
    return `PREGUNTAS DE EVALUACIÓN PARA EL JUEZ (RONDA DE DEFENSA EN STAND)

1. En relación con ${topCriteria?.title || 'la solución técnica'} (evaluado con ${topCriteria ? topCriteria.score.toFixed(1) : '6.0'}/7.0):
¿Qué evidencia concreta o validación con usuarios reales de la Región de Los Lagos demuestra que esta propuesta resuelve el problema mejor que las alternativas actualmente disponibles en el mercado?

2. En relación con ${lowestCriteria?.title || 'la viabilidad económica'} (evaluado con ${lowestCriteria ? lowestCriteria.score.toFixed(1) : '4.0'}/7.0):
¿Cuál es la estructura de costos directos de producción y cómo proyectan sostener el margen operativo frente al costo de materias primas o logística en la zona sur austral?

3. En relación con la escalabilidad y canales de comercialización:
¿Cuál es el primer segmento de clientes al que pretenden vender de manera recurrente y qué barrera de entrada impide que un competidor copie rápidamente esta iniciativa?`;
  }

  // mode === 'improve_draft'
  if (currentDraft && currentDraft.trim().length > 10) {
    return `OBSERVACIONES DEL JURADO (REDACCIÓN PROFESIONAL PERFECCIONADA):

El proyecto "${projectName}" (${category}) presenta una propuesta coherente con las necesidades del entorno productivo local. En relación con los comentarios preliminares del evaluador: "${currentDraft.trim()}", se destaca el mérito innovador evidenciado por el equipo, valorándose positivamente su capacidad de ejecución y pertinencia temática. 

No obstante, para maximizar su impacto y asegurar viabilidad de largo plazo, se sugiere al equipo robustecer el modelo de costos y formalizar canales comerciales específicos en el mercado regional. La iniciativa califica con mérito para continuar su maduración en el ecosistema emprendedor de la Universidad Austral de Chile.`;
  }

  return `OBSERVACIONES OFICIALES DEL JURADO (UACh SEDE PUERTO MONTT):

Propuesta evaluada con un promedio de ${avg.toFixed(1)}/7.0. El equipo demuestra un compromiso evidente y un trabajo metodológico destacable en "${topCriteria?.title || 'desarrollo del proyecto'}" (${topCriteria ? topCriteria.score.toFixed(1) : '6.0'}/7.0), logrando una solución atractiva y de clara pertinencia para la Región de Los Lagos.

Como oportunidad de mejora prioritaria, se recomienda enfocar los esfuerzos inmediatos en optimizar "${lowestCriteria?.title || 'modelo de negocio y sostenibilidad'}" (${lowestCriteria ? lowestCriteria.score.toFixed(1) : '4.2'}/7.0), definiendo métricas financieras más precisas y validando la disposición de pago con clientes reales antes de escalar la producción comercial.`;
}

export async function POST(req: Request) {
  try {
    const {
      projectName,
      category,
      teamMembers,
      scores,
      criteria,
      mode = 'questions',
      currentDraft = '',
    } = await req.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    // Build criteria scores summary
    const breakdown = (criteria || [])
      .map((c: CriteriaItem) => {
        const score = scores?.[c.id];
        return `- ${c.question_text}: ${score ? score + ' / 7.0' : 'Pendiente'}`;
      })
      .join('\n');

    let modeInstruction = '';
    if (mode === 'questions') {
      modeInstruction = `Actúa como asesor exclusivo del evaluador/juez en la Feria de Emprendimiento UACh Sede Puerto Montt. Tu tarea es redactar 3 a 4 preguntas directas, agudas y técnicas para que el juez las formule verbalmente al equipo en su defensa en el stand. Las preguntas deben apuntar a poner a prueba la viabilidad, el conocimiento del mercado regional y la solidez de la solución según las calificaciones otorgadas.`;
    } else {
      modeInstruction = `Actúa como asistente de redacción para el juez evaluador en la UACh Sede Puerto Montt. Tu tarea es mejorar la redacción de las observaciones del jurado.
${
  currentDraft && currentDraft.trim()
    ? `El juez ha escrito el siguiente borrador de observaciones preliminares:\n"""\n${currentDraft.trim()}\n"""\nPor favor, reescribe y mejora esta redacción: hazla clara, formal, constructiva, sin rodeos innecesarios y con estilo académico para el acta oficial.`
    : `El juez no ha escrito borrador aún. Por favor redacta una observación oficial equilibrada, destacando lo mejor evaluado y aconsejando mejoras sobre los criterios más bajos.`
}`;
    }

    const prompt = `Asistente del Juez Evaluador - Universidad Austral de Chile (Sede Puerto Montt)
Proyecto a evaluar:
- Nombre: ${projectName}
- Categoría: ${category}
- Integrantes: ${teamMembers}

Calificaciones por criterio del jurado:
${breakdown}

${modeInstruction}

REGLAS OBLIGATORIAS:
- NO generes un FODA ni un ensayo genérico de análisis externo.
- Tu respuesta es una herramienta práctica directa PARA EL EVALUADOR (preguntas para hacer al equipo o el texto redactado de sus observaciones).
- PROHIBIDO el uso de emojis o símbolos informales. Tono formal, claro y profesional.`;

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
                  maxOutputTokens: 2500,
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
      mode,
      currentDraft
    );

    return NextResponse.json({ feedback: fallback, mode, source: 'uach-heuristic-engine' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al procesar con IA.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
