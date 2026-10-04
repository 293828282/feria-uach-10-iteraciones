import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = 'dgrwztzyaqezezzbyuba';

const migrationSQL = `
CREATE TABLE IF NOT EXISTS public.quick_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT DEFAULT 'General',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for quick_notes" ON public.quick_notes;
CREATE POLICY "Public access for quick_notes" 
ON public.quick_notes 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_quick_notes_created_at ON public.quick_notes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quick_notes_pinned ON public.quick_notes (is_pinned DESC, created_at DESC);
`;

async function runMigration() {
  console.log('Running migration on Supabase project:', projectId);
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Migration failed: ${res.status} ${errText}`);
    }

    const result = await res.json();
    console.log('Migration executed successfully:', result);

    // Verify table structure
    const checkRes = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'quick_notes'
          ORDER BY ordinal_position;
        `
      })
    });
    const columns = await checkRes.json();
    console.log('Table quick_notes columns:', columns);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigration();
