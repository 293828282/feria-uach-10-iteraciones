import dotenv from 'dotenv';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'feria-uach-2026';

async function checkAndDisableProtection() {
  try {
    const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_NAME}`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    });
    const proj = await res.json();
    console.log('Project current protection:', {
      ssoProtection: proj.ssoProtection,
      passwordProtection: proj.passwordProtection,
    });

    // Disable any deployment protection for public access
    const updateRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_NAME}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ssoProtection: null,
        passwordProtection: null
      })
    });
    const updated = await updateRes.json();
    console.log('Updated protection settings:', {
      ssoProtection: updated.ssoProtection,
      passwordProtection: updated.passwordProtection
    });

    // Check public URL without auth headers
    const testUrl = 'https://feria-uach-2026.vercel.app';
    const testRes = await fetch(testUrl);
    console.log(`Public fetch status: ${testRes.status} (x-vercel-id: ${testRes.headers.get('x-vercel-id') ? 'YES' : 'NO'})`);
  } catch (err) {
    console.error('Error checking protection:', err);
  }
}

checkAndDisableProtection();
