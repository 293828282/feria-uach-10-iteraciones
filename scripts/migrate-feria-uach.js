import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = 'dgrwztzyaqezezzbyuba';

const ddl = `
-- 1. Tabla de Jueces
CREATE TABLE IF NOT EXISTS public.judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Stands / Emprendimientos
CREATE TABLE IF NOT EXISTS public.stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stand_number TEXT NOT NULL,
  project_name TEXT NOT NULL,
  category TEXT,
  team_members TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla Dinámica de Criterios
CREATE TABLE IF NOT EXISTS public.evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_index INT DEFAULT 0,
  question_text TEXT NOT NULL,
  description TEXT,
  max_score INT DEFAULT 7,
  weight DECIMAL(4,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Evaluaciones
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID REFERENCES public.judges(id) ON DELETE CASCADE,
  stand_id UUID REFERENCES public.stands(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES public.evaluation_criteria(id) ON DELETE CASCADE,
  score NUMERIC(3,1) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_evaluation_entry UNIQUE (judge_id, stand_id, criteria_id)
);

-- RLS
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for judges" ON public.judges;
CREATE POLICY "Public access for judges" ON public.judges FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for stands" ON public.stands;
CREATE POLICY "Public access for stands" ON public.stands FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for evaluation_criteria" ON public.evaluation_criteria;
CREATE POLICY "Public access for evaluation_criteria" ON public.evaluation_criteria FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for evaluations" ON public.evaluations;
CREATE POLICY "Public access for evaluations" ON public.evaluations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_stand ON public.evaluations(stand_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_judge ON public.evaluations(judge_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_criteria ON public.evaluations(criteria_id);
`;

const seedData = `
-- Insert judges if none exist
INSERT INTO public.judges (full_name)
SELECT name FROM (VALUES 
  ('Prof. Manuel Morales-Serazzi'),
  ('Clemente Caro Mallol'),
  ('Dra. Patricia Schmidt'),
  ('Ing. Rodrigo Silva')
) as t(name)
WHERE NOT EXISTS (SELECT 1 FROM public.judges LIMIT 1);

-- Insert stands if none exist
INSERT INTO public.stands (stand_number, project_name, category, team_members)
SELECT num, proj, cat, team FROM (VALUES 
  ('01', 'Marisco en Polvo', 'Innovación Alimentaria', 'Diego Aguilar, Viera Barrientos, Nikol Chamia, Tito Kamann, Ignacio Levicoy y Patricio Lillo'),
  ('02', 'El Sureñito', 'Gastronomía y Tradición', 'Janett Alvarez Pacheco, Valentina Barrientos Reyes, Tamara Oyarzo Gómez y Josepha Silva Proschle'),
  ('03', 'Botella Ajustable', 'Sustentabilidad y Diseño', 'Diana Barría, Jason Barrientos, Andrés Carrasco, Nicol Hernández y Nicolás Lavis'),
  ('04', 'Banda Depilatoria - Bandesia', 'Salud y Cuidado Personal', 'Pilar Carrillanca, Francisco Henríquez, Silvana Luengo, Fernando Almonacid, Evelyn Canipane y Soledad Donoso'),
  ('05', 'Salchicha Vegana', 'Alimentación Saludable', 'Fernanda Diedrichs, Alejandro Fuentes, Bárbara Garrido, Hellen Hurtado y Jennifer Pérez'),
  ('06', 'Licor de Manzana', 'Bebidas Artesanales', 'Jazmín Manqueia, Daniela Hernández, Vicente Caro, Rocío Oñato, Matías Oyarzún y Tatiana Mena')
) as t(num, proj, cat, team)
WHERE NOT EXISTS (SELECT 1 FROM public.stands LIMIT 1);

-- Insert evaluation criteria if none exist
INSERT INTO public.evaluation_criteria (order_index, question_text, description, max_score, weight)
SELECT ord, q, descrip, max_s, w FROM (VALUES 
  (1, 'Evaluación del Pitch', 'El grupo ha presentado su pitch de idea de negocio en menos de 3 minutos y expresa claramente lo que ofrece coherentemente con su stand de trabajo. La idea es clara y concreta.', 7, 1.0),
  (2, 'Identificación del problema', 'El problema que resuelve el producto o servicio ha sido claramente identificado. Hay evidencias claras y cubre una necesidad u oportunidad de mercado relevante.', 7, 1.0),
  (3, 'Idea de Negocio e Innovación', 'La idea de negocio se basa en un producto o servicio que atiende una problemática real, tiene componentes innovadores, es escalable y evidencia claridad sobre el cliente.', 7, 1.0),
  (4, 'Identificación del nicho de mercado', 'El grupo emprendedor ha identificado y cuantificado correctamente sus clientes potenciales y su nicho de mercado inicial.', 7, 1.0),
  (5, 'Propuesta de valor diferenciadora', 'El producto o servicio se diferencia, posee nuevos atributos o ventajas competitivas respecto al mercado. Crea ganancia y alivia dolores del consumidor.', 7, 1.0),
  (6, 'Marketing y canales de venta', 'Estrategia de venta definida, metas, logo, posicionamiento y canales de distribución que facilitan el acceso fluido del consumidor al producto.', 7, 1.0),
  (7, 'Presentación del Producto Mínimo Viable (PMV)', 'El prototipo/PMV es tangible, perfectamente comprensible y explícito. Especifica precio, características, beneficios y modo de uso.', 7, 1.0),
  (8, 'Evaluación y montaje del Stand', 'Puesta en escena convincente, montaje atractivo, colorido y con alta coherencia estética con la propuesta de valor.', 7, 1.0),
  (9, 'Presentación y habilidades del equipo', 'Profesionalismo, vestimenta semi-formal o uniforme, capacidad de convicción, complementariedad y dominio del negocio.', 7, 1.0),
  (10, 'Viabilidad económica y técnica', 'Insumos identificados, costos respaldados, punto de equilibrio estimado, flujo de ingresos proyectado y rentabilidad razonable.', 7, 1.0),
  (11, 'Potencial de escalabilidad y permanencia', 'El negocio cuenta con proyección sostenible en el tiempo y potencial claro de expansión y crecimiento en el mercado.', 7, 1.0)
) as t(ord, q, descrip, max_s, w)
WHERE NOT EXISTS (SELECT 1 FROM public.evaluation_criteria LIMIT 1);
`;

async function executeMigration() {
  console.log('Applying relational migrations on Supabase project:', projectId);
  try {
    // 1. Run DDL
    const ddlRes = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: ddl })
    });

    if (!ddlRes.ok) {
      const err = await ddlRes.text();
      throw new Error(`DDL failed: ${ddlRes.status} ${err}`);
    }
    console.log('DDL applied successfully.');

    // 2. Run Seed
    const seedRes = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: seedData })
    });

    if (!seedRes.ok) {
      const err = await seedRes.text();
      throw new Error(`Seed failed: ${seedRes.status} ${err}`);
    }
    console.log('Seed executed successfully.');

    // Verify counts
    const countRes = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          SELECT 
            (SELECT count(*) FROM public.judges) as judges_count,
            (SELECT count(*) FROM public.stands) as stands_count,
            (SELECT count(*) FROM public.evaluation_criteria) as criteria_count,
            (SELECT count(*) FROM public.evaluations) as evaluations_count;
        `
      })
    });
    const counts = await countRes.json();
    console.log('Counts in database:', counts);

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

executeMigration();
