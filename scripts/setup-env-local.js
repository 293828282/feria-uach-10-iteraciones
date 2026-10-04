import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = 'dgrwztzyaqezezzbyuba';

async function setupEnv() {
  const resKeys = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const keys = await resKeys.json();
  const anonKey = keys.find(k => k.name === 'anon' || k.tags?.includes('anon'))?.api_key || keys[0]?.api_key;
  const supabaseUrl = `https://${projectId}.supabase.co`;

  const envLocalContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}\n`;
  fs.writeFileSync('.env.local', envLocalContent);
  console.log('.env.local created successfully!');
}

setupEnv();
