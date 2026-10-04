import dotenv from 'dotenv';
import { execSync } from 'child_process';
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER || '293828282';
const REPO_NAME = 'feria-uach-2026';

async function pushToGitHub() {
  console.log(`Setting up GitHub repo: ${GITHUB_USER}/${REPO_NAME}...`);

  try {
    const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AMAES-Agent',
      },
    });

    if (checkRes.status === 200) {
      console.log(`Repository ${REPO_NAME} already exists.`);
    } else if (checkRes.status === 404) {
      console.log(`Creating private repository ${REPO_NAME} on GitHub...`);
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'AMAES-Agent',
        },
        body: JSON.stringify({
          name: REPO_NAME,
          description: 'Plataforma de Evaluacion Feria de Emprendimiento UACh 2026 con Supabase y Next.js',
          private: true,
          auto_init: false,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`Failed to create repository: ${createRes.status} ${err}`);
      }
      const data = await createRes.json();
      console.log(`Repository created: ${data.html_url}`);
    }

    // Git commands
    const remoteUrl = `https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git`;

    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch {
      // ignore
    }

    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });

    const status = execSync('git status --porcelain').toString();
    if (status.trim()) {
      execSync('git commit -m "feat: complete release of Plataforma Feria de Emprendimiento UACh 2026"', { stdio: 'inherit' });
    } else {
      console.log('No new files to commit.');
    }

    console.log('Pushing to GitHub main branch...');
    execSync('git push -u origin main --force', { stdio: 'inherit' });
    console.log(`Repository successfully pushed to https://github.com/${GITHUB_USER}/${REPO_NAME}`);
  } catch (err) {
    console.error('Error deploying to GitHub:', err);
    process.exit(1);
  }
}

pushToGitHub();
