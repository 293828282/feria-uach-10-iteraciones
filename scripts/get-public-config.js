import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = 'dgrwztzyaqezezzbyuba';

async function verifyClient() {
  const resKeys = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const keys = await resKeys.json();
  const anonKey = keys.find(k => k.name === 'anon' || k.tags?.includes('anon'))?.api_key || keys[0]?.api_key;
  const supabaseUrl = `https://${projectId}.supabase.co`;

  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('ANON_KEY_PREFIX:', anonKey.substring(0, 20) + '...');

  const supabase = createClient(supabaseUrl, anonKey);

  // Insert test row
  const { data: inserted, error: insertError } = await supabase
    .from('quick_notes')
    .insert([
      { title: 'Bienvenida a QuickNotes Pro', content: 'Tu espacio seguro y minimalista para capturar ideas al instante con Supabase.', category: 'Personal', is_pinned: true }
    ])
    .select();

  if (insertError) {
    console.error('Insert error:', insertError);
  } else {
    console.log('Inserted row successfully:', inserted);
  }

  // Select test
  const { data: notes, error: selectError } = await supabase
    .from('quick_notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (selectError) {
    console.error('Select error:', selectError);
  } else {
    console.log('Selected notes count:', notes.length);
  }
}

verifyClient();
