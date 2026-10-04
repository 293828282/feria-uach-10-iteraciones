# Product Specification: Plataforma de Evaluación Feria de Emprendimiento UACh 2026

## 1. Visión y Propósito del Producto
Sistema web institucional y responsivo (Mobile-First para tablets y smartphones de jueces en terreno) diseñado para la evaluación en tiempo real de stands y proyectos de emprendimiento en la Universidad Austral de Chile (UACh). 

El sistema separa estrictamente dos entornos:
1. **Entorno de Jueces (Flujo Ágil):** Selección rápida de juez, selección dinámica del stand mediante buscador/filtro, evaluación cuantitativa fluida con escala numérica y feedback cualitativo.
2. **Panel de Control Administrativo (Master Dashboard):** Configuración en vivo de participantes, edición dinámica de criterios/preguntas, métricas analíticas consolidadas, ranking ponderado en tiempo real y detección de ganador y proyectos destacados.

---

## 2. Requerimientos de Identidad Visual y Recursos Locales
- **Ruta de Recursos Locales:** Acceder a `C:\Users\jcbca\OneDrive\Escritorio\App de jueces` para extraer:
  * El isotipo/imagotipo oficial de la UACh.
  * La estructura tabular del archivo Excel con los criterios de evaluación base y ponderaciones.
- **Identidad de Diseño:**
  * Paleta institucional austera y refinada: base neutra en escala Zinc (`zinc-950`, `zinc-900`, `zinc-100`), acentos institucionales UACh en tonalidades verde bosque profundo (`emerald-800` / `forest-green`) y microbordes contrastados de 1px (`border-zinc-800`).
  * **Cero Emojis:** Prohibido cualquier uso de emojis en vistas de evaluación, tarjetas o botones.
  * **Iconografía SVG Hecha a Mano:** Todos los glifos (estrella de ponderación, check de guardado, filtro de búsqueda, logout, métricas de podio, lápiz de edición y papelera) deben ser componentes SVG puros en `/components/ui/vectors/`.
  * Números y promedios tabulares con clase `font-mono tabular-nums`.

---

## 3. Modelo de Datos Relacional (Supabase)

El agente debe ejecutar las migraciones SQL para crear las siguientes tablas en Supabase con RLS habilitado:

```sql
-- 1. Tabla de Jueces registrados
create table judges (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Tabla de Emprendimientos / Stands
create table stands (
  id uuid primary key default gen_random_uuid(),
  stand_number text not null,
  project_name text not null,
  category text,
  team_members text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Tabla Dinámica de Criterios / Preguntas de Evaluación
create table evaluation_criteria (
  id uuid primary key default gen_random_uuid(),
  order_index int default 0,
  question_text text not null,
  description text,
  max_score int default 7,
  weight decimal(4,2) default 1.0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. Tabla de Evaluaciones / Votos Emitidos
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid references judges(id) on delete cascade,
  stand_id uuid references stands(id) on delete cascade,
  criteria_id uuid references evaluation_criteria(id) on delete cascade,
  score numeric(3,1) not null,
  feedback text,
  created_at timestamptz default now(),
  constraint unique_evaluation_entry unique (judge_id, stand_id, criteria_id)
);