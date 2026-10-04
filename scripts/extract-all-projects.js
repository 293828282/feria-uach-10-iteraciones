import xlsx from 'xlsx';

const filePath = 'C:\\Users\\jcbca\\OneDrive\\Escritorio\\App de jueces\\PAUTA DE EVALUACIÓN IDEAS DE NEGOCIO 2024.xlsx';
const workbook = xlsx.readFile(filePath);

// Let's parse all rows of Hoja1 to discover all projects
const hoja1 = xlsx.utils.sheet_to_json(workbook.Sheets['Hoja1'], { header: 1 });
console.log('--- ALL ROWS IN HOJA 1 ---');
hoja1.forEach((row, idx) => {
  if (row && row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
    console.log(`L${idx + 1}:`, JSON.stringify(row));
  }
});
