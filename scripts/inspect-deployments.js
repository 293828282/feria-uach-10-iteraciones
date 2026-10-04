import dotenv from 'dotenv';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function inspect() {
  const res = await fetch('https://api.vercel.com/v6/deployments?limit=5', {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  const data = await res.json();
  console.log('Deployments:', JSON.stringify(data.deployments?.map(d => ({
    id: d.uid,
    name: d.name,
    url: d.url,
    state: d.state,
    errorMessage: d.errorMessage,
    createdAt: d.created
  })), null, 2));

  if (data.deployments?.[0]) {
    const id = data.deployments[0].uid;
    const eventsRes = await fetch(`https://api.vercel.com/v2/deployments/${id}/events`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    });
    const events = await eventsRes.json();
    console.log('--- Logs for deployment', id, '---');
    events.slice(-30).forEach(e => {
      if (e.text) console.log(e.text);
    });
  }
}

inspect();
