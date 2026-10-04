import dotenv from 'dotenv';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'quicknotes-pro';

async function checkLogs() {
  const depRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=prj_BpbtxipsKYgyO7DSzY2vs7Dsh9Ok&limit=1`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  const data = await depRes.json();
  const latest = data.deployments?.[0];
  console.log('Latest deployment:', latest?.id, latest?.url, latest?.readyState);

  if (latest?.id) {
    const eventsRes = await fetch(`https://api.vercel.com/v2/deployments/${latest.id}/events`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    });
    const events = await eventsRes.json();
    console.log('Build logs:');
    events.forEach(e => {
      if (e.text) console.log(e.text);
    });
  }
}

checkLogs();
