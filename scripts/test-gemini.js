import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_AI_API_KEY;

async function testGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Hola, confirma conexion con la UACh en 1 linea sin emojis.' }] }]
    })
  });
  const data = await res.json();
  console.log('Gemini status:', res.status);
  console.log('Gemini text:', data.candidates?.[0]?.content?.parts?.[0]?.text);
}

testGemini();
