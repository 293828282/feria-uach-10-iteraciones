import dotenv from 'dotenv';
import { execSync } from 'child_process';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'quicknotes-pro';

async function deployToVercel() {
  console.log(`Configuring Vercel project: ${PROJECT_NAME}...`);

  // 1. Get Supabase credentials
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgrwztzyaqezezzbyuba.supabase.co';
  
  // Read anon key
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectId = 'dgrwztzyaqezezzbyuba';
  const resKeys = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const keys = await resKeys.json();
  const SUPABASE_ANON_KEY = keys.find(k => k.name === 'anon' || k.tags?.includes('anon'))?.api_key || keys[0]?.api_key;

  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Supabase Anon Key ready');

  // 2. Check or create project on Vercel
  let projectData;
  const getProjRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_NAME}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });

  if (getProjRes.status === 200) {
    projectData = await getProjRes.json();
    console.log(`Project ${PROJECT_NAME} exists on Vercel.`);
  } else {
    console.log(`Creating project ${PROJECT_NAME} on Vercel...`);
    const createProjRes = await fetch('https://api.vercel.com/v10/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: PROJECT_NAME,
        framework: 'nextjs'
      })
    });
    projectData = await createProjRes.json();
    console.log(`Project created on Vercel with ID: ${projectData.id}`);
  }

  // 3. Set environment variables on Vercel
  const envVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: SUPABASE_URL },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY }
  ];

  for (const env of envVars) {
    try {
      const addEnvRes = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_NAME}/env`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: env.key,
          value: env.value,
          type: 'plain',
          target: ['production', 'preview', 'development']
        })
      });
      if (addEnvRes.ok) {
        console.log(`Injected env variable: ${env.key}`);
      } else {
        const err = await addEnvRes.json();
        console.log(`Env variable ${env.key} notice:`, err.error?.message || err);
      }
    } catch (e) {
      console.warn(`Error setting env ${env.key}:`, e.message);
    }
  }

  // 4. Deploy using Vercel CLI
  console.log('Triggering production build & deploy via Vercel CLI...');
  try {
    const deployOutput = execSync(
      `npx vercel deploy --prod --yes --token ${VERCEL_TOKEN}`,
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    console.log('Deploy Output:\n', deployOutput);

    // Extract URL
    const lines = deployOutput.trim().split('\n');
    const deploymentUrl = lines.find(l => l.includes('https://') && l.includes('.vercel.app')) || lines[lines.length - 1];
    console.log(`\n========================================`);
    console.log(`DEPLOYMENT SUCCESSFUL!`);
    console.log(`Production URL: ${deploymentUrl.trim()}`);
    console.log(`========================================\n`);

    // Verify HTTP 200
    const cleanUrl = deploymentUrl.trim().match(/https:\/\/[^\s]+/)?.[0] || deploymentUrl.trim();
    console.log(`Verifying HTTP response for ${cleanUrl}...`);
    const checkHttp = await fetch(cleanUrl);
    console.log(`HTTP Status: ${checkHttp.status} ${checkHttp.statusText}`);
  } catch (deployErr) {
    console.error('Error during Vercel deploy:', deployErr.stdout || deployErr.stderr || deployErr.message);
    process.exit(1);
  }
}

deployToVercel();
