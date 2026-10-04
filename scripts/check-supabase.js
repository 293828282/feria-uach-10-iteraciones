import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;

async function checkSupabase() {
  try {
    const resOrgs = await fetch('https://api.supabase.com/v1/organizations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const orgs = await resOrgs.json();
    console.log('Organizations:', JSON.stringify(orgs, null, 2));

    const resProj = await fetch('https://api.supabase.com/v1/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await resProj.json();
    console.log('Projects:', JSON.stringify(projects.map(p => ({
      id: p.id,
      name: p.name,
      region: p.region,
      status: p.status,
      created_at: p.created_at
    })), null, 2));
  } catch (err) {
    console.error('Error checking Supabase:', err);
  }
}

checkSupabase();
