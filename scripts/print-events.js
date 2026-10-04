import dotenv from 'dotenv';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function printLogs() {
  const depId = 'dpl_5XrMvLxK453ZwwTK94L9nQNkHZK2';
  const res = await fetch(`https://api.vercel.com/v2/deployments/${depId}/events`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  const text = await res.text();
  console.log('Raw events response length:', text.length);
  try {
    const json = JSON.parse(text);
    console.log('Events array length:', json.length);
    json.forEach(e => {
      console.log(e.text || e.payload?.text || e);
    });
  } catch {
    console.log('Text preview:', text.substring(0, 1000));
  }
}

printLogs();
