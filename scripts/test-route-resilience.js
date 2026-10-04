// Test the route fallback directly
import { POST } from '../src/app/api/ai-feedback/route.js';

async function testFallback() {
  const req = new Request('http://localhost:3000/api/ai-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName: 'Licor de Manzana Chilota',
      category: 'Bebidas Artesanales',
      teamMembers: 'Camila Soto y Rodrigo Alarcón',
      scores: { 'c1': 6, 'c2': 5 },
      criteria: [
        { id: 'c1', question_text: 'Propuesta de Valor e Innovación' },
        { id: 'c2', question_text: 'Sostenibilidad y Modelo Financiero' }
      ],
      mode: 'feedback'
    })
  });

  const res = await POST(req);
  console.log('Status code:', res.status);
  const json = await res.json();
  console.log('Returned feedback:\n', json.feedback);
  console.log('Source:', json.source);
}

testFallback();
