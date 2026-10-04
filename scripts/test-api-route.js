import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const key = process.env.GOOGLE_AI_API_KEY;

async function testRoute() {
  const model = 'gemini-flash-latest';
  const prompt = 'Actúa como evaluador UACh Sede Puerto Montt. Evalúa el proyecto Innovación Láctea con nota 6.0.';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  console.log('API Status:', res.status);
  const data = await res.json();
  console.log('Sample output:', data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 150));
}

testRoute();
