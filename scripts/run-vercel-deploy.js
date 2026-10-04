import dotenv from 'dotenv';
import { execSync } from 'child_process';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function runDeploy() {
  console.log('Triggering production build & deploy for quicknotes-pro...');
  try {
    const output = execSync(`npx vercel deploy --prod --yes --token ${VERCEL_TOKEN}`, {
      encoding: 'utf-8'
    });
    console.log('Deploy Output:\n', output);

    const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.vercel\.app/);
    if (match) {
      console.log('Production URL detected:', match[0]);
      
      console.log('Verifying HTTP response...');
      const res = await fetch(match[0]);
      console.log(`Status: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error('Deployment error:', err.stdout || err.stderr || err.message);
    process.exit(1);
  }
}

runDeploy();
