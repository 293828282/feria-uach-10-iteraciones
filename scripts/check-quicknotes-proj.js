import dotenv from 'dotenv';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function checkProject() {
  const res = await fetch('https://api.vercel.com/v9/projects/quicknotes-pro', {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  const data = await res.json();
  console.log('Project quicknotes-pro info:', {
    id: data.id,
    name: data.name,
    accountId: data.accountId,
    framework: data.framework,
    env: data.env?.map(e => e.key)
  });
}

checkProject();
