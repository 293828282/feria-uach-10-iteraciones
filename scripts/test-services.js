import dotenv from 'dotenv';
dotenv.config();

async function testServices() {
  console.log('--- Checking GitHub ---');
  try {
    const ghRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'AMAES-Agent',
        Accept: 'application/vnd.github.v3+json'
      }
    });
    const ghUser = await ghRes.json();
    console.log('GitHub user:', ghUser.login, 'Scopes:', ghRes.headers.get('x-oauth-scopes'));
  } catch (e) {
    console.error('GitHub error:', e);
  }

  console.log('--- Checking Vercel ---');
  try {
    const vRes = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    });
    const vUser = await vRes.json();
    console.log('Vercel user:', vUser.user ? vUser.user.username || vUser.user.email : vUser);
  } catch (e) {
    console.error('Vercel error:', e);
  }
}

testServices();
