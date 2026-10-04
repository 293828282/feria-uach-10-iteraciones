import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = 'dgrwztzyaqezezzbyuba';

async function testQuery() {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'SELECT NOW() as current_time;'
      })
    });
    const data = await res.json();
    console.log('Query result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

testQuery();
