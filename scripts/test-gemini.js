import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const key = process.env.GOOGLE_AI_API_KEY;

async function testModel(model) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Hola, di test' }] }] })
    });
    console.log(model, 'Status:', res.status);
    if (!res.ok) {
      const txt = await res.text();
      console.log('Error:', txt.slice(0, 150));
    } else {
      const data = await res.json();
      console.log('Success:', data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
    }
  } catch(e) {
    console.log(model, 'Fetch Error:', e.message);
  }
}

async function run() {
  await testModel('gemini-flash-latest');
  await testModel('gemini-flash-lite-latest');
  await testModel('gemini-3.5-flash');
  await testModel('gemini-3.8-flash');
}
run();
