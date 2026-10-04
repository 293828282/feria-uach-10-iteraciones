import dotenv from 'dotenv';
import { execSync } from 'child_process';
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER || '293828282';
const REPO_NAME = 'quicknotes-pro';

async function setupAndPushRepo() {
  console.log(`Setting up GitHub repository: ${GITHUB_USER}/${REPO_NAME}...`);

  // 1. Check or create repository via GitHub API
  let repoExists = false;
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AMAES-Agent'
      }
    });

    if (checkRes.status === 200) {
      console.log(`Repository ${REPO_NAME} already exists.`);
      repoExists = true;
    } else if (checkRes.status === 404) {
      console.log(`Creating private repository ${REPO_NAME} on GitHub...`);
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'AMAES-Agent'
        },
        body: JSON.stringify({
          name: REPO_NAME,
          description: 'QuickNotes Pro - Autonomous Cloud Note Taking Web Application with Supabase',
          private: true,
          auto_init: false
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to create repository: ${createRes.status} ${errText}`);
      }
      const newRepo = await createRes.json();
      console.log(`Repository created successfully: ${newRepo.html_url}`);
    } else {
      const errText = await checkRes.text();
      throw new Error(`Unexpected error checking repo: ${checkRes.status} ${errText}`);
    }
  } catch (err) {
    console.error('Error with GitHub API:', err);
    process.exit(1);
  }

  // 2. Git setup and push
  try {
    execSync('git init', { stdio: 'inherit' });
    execSync('git branch -M main', { stdio: 'inherit' });
    execSync(`git config user.name "${GITHUB_USER}"`, { stdio: 'inherit' });
    execSync(`git config user.email "${GITHUB_USER}@users.noreply.github.com"`, { stdio: 'inherit' });

    const remoteUrl = `https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git`;
    
    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch {
      // ignore if origin does not exist
    }

    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });

    execSync('git add .', { stdio: 'inherit' });
    
    // Status check
    const status = execSync('git status --porcelain').toString();
    if (status.trim()) {
      execSync('git commit -m "feat: initial release of QuickNotes Pro with Supabase and custom SVG vectors"', { stdio: 'inherit' });
    } else {
      console.log('No new changes to commit.');
    }

    console.log('Pushing to GitHub main branch...');
    execSync('git push -u origin main --force', { stdio: 'inherit' });
    console.log(`Pushed to https://github.com/${GITHUB_USER}/${REPO_NAME}`);
  } catch (err) {
    console.error('Error during git execution:', err);
    process.exit(1);
  }
}

setupAndPushRepo();
