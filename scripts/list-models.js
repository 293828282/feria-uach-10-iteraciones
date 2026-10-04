import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const key = process.env.GOOGLE_AI_API_KEY;

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.models) {
      console.log('Available models:');
      data.models.filter(m => m.supportedGenerationMethods?.includes('generateContent')).forEach(m => console.log(' - ', m.name));
    } else {
      console.log('Error listing:', data);
    }
  } catch (e) {
    console.error(e);
  }
}

listModels();
