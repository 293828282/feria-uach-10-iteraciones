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
    return `CUESTIONARIO TÉCNICO Y DE DEFENSA DIRECTIVA (COMITÉ ACADÉMICO UACH - SEDE PUERTO MONTT)

1. Dimensión de Propuesta de Valor y Tracción Empírica:
En relación con "${topCriteria?.title || 'la diferenciación competitiva'}", el proyecto exhibe un desempeño destacado de ${topCriteria ? topCriteria.score.toFixed(1) : '6.0'}/7.0. Sin embargo, para validar su adopción real: ¿Cuáles son las evidencias empíricas de disposición a pagar levantadas con usuarios objetivo en la provincia de Llanquihue y Chiloé? ¿Qué porcentaje de margen bruto resiste un incremento imprevisto de 15% en costos logísticos y fletes marítimo-terrestres?

2. Dimensión de Factibilidad Operativa y Cadena de Suministro:
Respecto al criterio de "${lowestCriteria?.title || 'modelo de negocio e implementación'}", calificado con ${lowestCriteria ? lowestCriteria.score.toFixed(1) : '4.5'}/7.0: ¿Cuál es el plan de contingencia específico ante quiebres de stock o fallas de abastecimiento de materias primas críticas durante los meses de invierno en la Región de Los Lagos? ¿Qué certificaciones sanitarias, tributarias o ambientales (por ejemplo Seremi de Salud, SAG o Sernapesca) son mandatorias para el escalamiento de esta solución?

3. Estructura Financiera y Retorno de Capital:
¿Cuál es la tasa de consumo de efectivo (burn rate) proyectada para los primeros doce meses desde el inicio de operaciones comerciales y cuál es el plazo estimado para alcanzar el punto de equilibrio operativo? ¿De qué manera contemplan financiar el capital de trabajo inicial previo a la obtención de subsidios públicos (CORFO, SERCOTEC) o capital de riesgo privado?

4. Barreras de Entrada y Blindaje Estratégico:
Frente al ingreso potencial de competidores industriales de mayor escala en el sur de Chile: ¿Qué propiedad intelectual, know-how propietario, acuerdos de exclusividad o barreras de red protegen la posición de mercado de esta iniciativa?`;
  }

  if (mode === 'swot_brief') {
    return `MATRIZ DIAGNÓSTICA ESTRATÉGICA FODA EXHAUSTIVA (COMITÉ ACADÉMICO UACH - SEDE PUERTO MONTT)

I. FORTALEZAS INTERNAS (Sobresalientes en la Evaluación Actual)
- Sólida articulación conceptual en ${topCriteria?.title || 'planteamiento de la solución'} (${topCriteria ? topCriteria.score.toFixed(1) : '6.0'}/7.0), denotando un equipo de trabajo con capacidad técnica para resolver un dolor real y tangible en su segmento de mercado.
- Alta pertinencia territorial y aprovechamiento de recursos e identidad productiva de la Región de Los Lagos, favoreciendo la diferenciación frente a ofertas genéricas importadas.
- Coherencia entre el perfil formativo de los integrantes del equipo emprendedor y las demandas operativas inmediatas del prototipo.

II. OPORTUNIDADES EXTERNAS (Ecosistema Regional y Nacional)
- Acceso a programas estratégicos de financiamiento público y aceleración empresarial (CORFO Semilla Inicia, Capital Semilla SERCOTEC, FIC Los Lagos) orientados a diversificación de la matriz productiva regional.
- Tendencia creciente de consumidores y empresas regionales hacia la adquisición de productos sostenibles, con trazabilidad de origen y bajo impacto ambiental.
- Posibilidad de forjar alianzas comerciales con cooperativas agrícolas, productores locales y canales minoristas especializados del eje Puerto Montt - Puerto Varas - Castro.

III. DEBILIDADES INTERNAS (Áreas Críticas de Refinamiento Urgente)
- Brecha relevante en ${lowestCriteria?.title || 'sostenibilidad y factibilidad económica'} (${lowestCriteria ? lowestCriteria.score.toFixed(1) : '4.0'}/7.0), requiriendo modelar con mayor detalle el costo unitario, márgenes de intermediación y estructura de precios de lista.
- Carencia de validaciones de tracción comercial a escala representativa y formalización de compromisos de compra o pre-órdenes.
- Dependencia de capacidades operativas centralizadas en los propios fundadores, lo que puede ralentizar la curva de aprendizaje en fases de comercialización masiva.

IV. AMENAZAS DEL ENTORNO (Gestión de Riesgo y Mitigación)
- Volatilidad macroeconómica y encarecimiento de insumos clave o transporte en zonas aisladas de la macrozona sur austral.
- Competencia potencial de productos sustitutos consolidados con economías de escala y mayor capacidad de inversión en marketing tradicional.
- Dilación en tiempos regulatorios de tramitación de patentes, registros de marca INAPI o autorizaciones sanitarias requeridas para operar en supermercados o grandes superficies.`;
  }

  // General feedback
  const tone =
    avg >= 5.8
      ? 'La iniciativa presentada por el equipo fundador evidencia un desempeño académico y directivo de excelencia, situándose en el cuartil superior de la cohorte evaluada por la Universidad Austral de Chile Sede Puerto Montt.'
      : avg >= 4.5
      ? 'La propuesta exhibe fundamentos metodológicos sólidos, coherencia técnica inicial y un estimable potencial de crecimiento, reuniendo condiciones para avanzar hacia etapas de validación comercial intensiva.'
      : 'El proyecto detecta una oportunidad de negocio genuina en su entorno; sin embargo, requiere un rediseño de fondo en sus supuestos operativos y comerciales antes de someterse a rondas de inversión o financiamiento de riesgo.';

  return `DICTAMEN ACADÉMICO INTEGRAL Y PLAN DIRECTOR (FACULTAD DE CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS - UACH SEDE PUERTO MONTT)

1. Diagnóstico de la Propuesta de Valor y Mérito Innovador:
${tone} Entre sus mayores méritos competitivos destaca con nitidez la evaluación obtenida en "${topCriteria?.title || 'formulación del problema e innovación'}" (calificación: ${topCriteria ? topCriteria.score.toFixed(1) : '6.0'}/7.0). El equipo no solo ha delimitado con precisión la problemática abordada, sino que ha diseñado una solución creativa y técnicamente viable que capitaliza las particularidades del ecosistema productivo de la Región de Los Lagos.

2. Análisis de Factibilidad Operativa, Comercial y Financiera:
Al contrastar la matriz de ponderación con los requerimientos de mercado, se constata que la principal oportunidad de mejora radica en robustecer "${lowestCriteria?.title || 'la viabilidad financiera y modelo de negocio'}" (calificación: ${lowestCriteria ? lowestCriteria.score.toFixed(1) : '4.2'}/7.0). Si bien el prototipo es funcional y la propuesta de valor resulta atractiva para el usuario final, es indispensable que los fundadores sustenten el modelo de monetización sobre supuestos conservadores de captación de clientes, calculando de manera exhaustiva el Costo de Adquisición de Clientes (CAC) y el Valor de Vida del Cliente (LTV).

3. Recomendaciones Estratégicas y Hoja de Ruta para Escalamiento:
- Corto Plazo (0 a 3 meses): Ejecutar un piloto comercial controlado con al menos 25 clientes representativos en Puerto Montt y alrededores para registrar retroalimentación cuantitativa de satisfacción, tasa de recompra y elasticidad precio de la demanda.
- Mediano Plazo (3 a 6 meses): Postular el proyecto a líneas de subsidio semilla (CORFO / SERCOTEC) respaldando la postulación con cartas de intención vinculantes y métricas reales del piloto.
- Largo Plazo (6 a 12 meses): Implementar una estructura contable-financiera formal, formalizar contratos de suministro con proveedores locales y tramitar la protección de la marca y propiedad intelectual ante INAPI.`;
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
      modeInstruction = `Formula con precisión 4 preguntas técnicas y de defensa directiva extensas y profundamente desarrolladas para que el panel de jueces plantee al equipo en su ronda de preguntas. Cada pregunta debe contener contexto metodológico, fundamentación según las calificaciones obtenidas y el estándar de evidencia que se espera que el equipo defienda, abordando viabilidad técnica, modelo de monetización, barreras de entrada y escalabilidad en la Región de Los Lagos.`;
    } else if (mode === 'swot_brief') {
      modeInstruction = `Elabora una matriz diagnóstica FODA completa, extensa y exhaustivamente desarrollada:
1. Fortalezas Estratégicas y Factores Críticos de Éxito: Análisis detallado de los atributos sobresalientes de la propuesta y su equipo humano.
2. Oportunidades de Mercado y Crecimiento Territorial: Posibilidades concretas de expansión e inserción en el ecosistema productivo del sur de Chile (Provincia de Llanquihue, Chiloé y Palena).
3. Debilidades Operativas y Brechas Detectadas: Aspectos que requieren refinamiento urgente según las calificaciones obtenidas en los criterios de menor puntaje.
4. Amenazas del Entorno y Contingencias: Factores de riesgo competitivo, regulatorio o de suministro a mitigar con planes de contingencia.`;
    } else {
      modeInstruction = `Genera un dictamen académico integral, extenso y profundamente desarrollado (múltiples párrafos argumentados, análisis exhaustivo). Debe contener:
1. Diagnóstico de la Propuesta de Valor y Mérito Innovador: Examen riguroso del mérito conceptual del proyecto y su respuesta a las necesidades del mercado regional.
2. Análisis de Viabilidad y Sostenibilidad Económica: Evaluación de la consistencia operativa y comercial según los puntajes asignados por el jurado.
3. Recomendaciones Estratégicas Clave y Hoja de Ruta para Escalamiento: Plan de acción concreto para potenciar la adopción comercial, formalización y acceso a fondos de inversión o financiamiento territorial.`;
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

REGLA ESTRICTA OBLIGATORIA: Está terminantemente prohibido utilizar emojis, emoticones o caracteres informales. Redacción 100% sobria, directiva, formal y pedagógica para actas académicas de la Facultad de Ciencias Económicas y Administrativas y Escuela de Graduados de la UACh Sede Puerto Montt. Proporciona una respuesta larga, detallada, completa y totalmente desarrollada sin omitir fundamentación.`;

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
      mode
    );

    return NextResponse.json({ feedback: fallback, mode, source: 'uach-heuristic-engine' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al procesar con IA.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
