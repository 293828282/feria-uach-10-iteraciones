import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = 'dgrwztzyaqezezzbyuba';

async function getProjectDetails() {
  try {
    const resKeys = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const keys = await resKeys.json();
    console.log('API Keys types:', keys.map(k => ({ name: k.name, type: k.type })));
    const anonKey = keys.find(k => k.name === 'anon' || k.tags?.includes('anon'))?.api_key || keys[0]?.api_key;
    console.log('Anon key found:', anonKey ? 'YES (length ' + anonKey.length + ')' : 'NO');
    console.log('Supabase URL:', `https://${projectId}.supabase.co`);
  } catch (err) {
    console.error('Error fetching details:', err);
  }
}

getProjectDetails();
