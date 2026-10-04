import dotenv from 'dotenv';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function checkDetails() {
  const depId = 'dpl_5XrMvLxK453ZwwTK94L9nQNkHZK2';
  const res = await fetch(`https://api.vercel.com/v13/deployments/${depId}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  const data = await res.json();
  console.log('Deployment info:', {
    framework: data.framework,
    builds: data.builds,
    errorCode: data.errorCode,
    errorMessage: data.errorMessage,
    build: data.build
  });
}

checkDetails();
