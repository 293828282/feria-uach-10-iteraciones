import dotenv from 'dotenv';
import fs from 'fs';
import { execSync } from 'child_process';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'feria-uach-10-iteraciones';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgrwztzyaqezezzbyuba.supabase.co';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';

async function deployFeriaVercel() {
  console.log(`Setting up Vercel project: ${PROJECT_NAME}...`);

  // 1. Get Supabase Anon Key
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectId = 'dgrwztzyaqezezzbyuba';
  const resKeys = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const keys = await resKeys.json();
  const SUPABASE_ANON_KEY = keys.find(k => k.name === 'anon' || k.tags?.includes('anon'))?.api_key || keys[0]?.api_key;

  // 2. Check or create project on Vercel
  let projectData;
  const getProjRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_NAME}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });

  if (getProjRes.status === 200) {
    projectData = await getProjRes.json();
    console.log(`Project ${PROJECT_NAME} already exists on Vercel (ID: ${projectData.id}).`);
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

  // 3. Inject Environment Variables (including GOOGLE_AI_API_KEY for Gemini AI)
  const envVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: SUPABASE_URL },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
    { key: 'GOOGLE_AI_API_KEY', value: GOOGLE_AI_API_KEY }
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
        console.log(`Injected env: ${env.key}`);
      } else {
        const err = await addEnvRes.json();
        console.log(`Env notice (${env.key}):`, err.error?.message || err);
      }
    } catch (e) {
      console.warn(`Error injecting ${env.key}:`, e.message);
    }
  }

  // 4. Update .vercel/project.json
  const vercelProjectJson = {
    projectId: projectData.id,
    orgId: projectData.accountId || 'team_l4x1LYEQNoBHjsKmY2antuA9',
    projectName: PROJECT_NAME
  };
  fs.mkdirSync('.vercel', { recursive: true });
  fs.writeFileSync('.vercel/project.json', JSON.stringify(vercelProjectJson, null, 2));
  console.log('Updated .vercel/project.json with project ID:', projectData.id);

  // 5. Deploy to Vercel via CLI
  console.log('Deploying production build to Vercel...');
  try {
    const output = execSync(`npx vercel deploy --prod --yes --token ${VERCEL_TOKEN}`, {
      encoding: 'utf-8'
    });
    console.log('Deploy Output:\n', output);

    const matches = output.match(/https:\/\/[a-zA-Z0-9-]+\.vercel\.app/g);
    const prodUrl = matches ? matches[matches.length - 1] : `https://${PROJECT_NAME}.vercel.app`;
    console.log(`\n========================================`);
    console.log(`FERIA UACH 2026 DEPLOYED SUCCESSFULLY!`);
    console.log(`URL: ${prodUrl}`);
    console.log(`========================================\n`);

    // Verify HTTP 200
    console.log(`Checking HTTP response for ${prodUrl}...`);
    const res = await fetch(prodUrl);
    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error('Deployment error:', err.stdout || err.stderr || err.message);
    process.exit(1);
  }
}

deployFeriaVercel();
