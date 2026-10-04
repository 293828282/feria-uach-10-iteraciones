import xlsx from 'xlsx';
import path from 'path';

const filePath = 'C:\\Users\\jcbca\\OneDrive\\Escritorio\\App de jueces\\PAUTA DE EVALUACIÓN IDEAS DE NEGOCIO 2024.xlsx';

const workbook = xlsx.readFile(filePath);
console.log('Sheet names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  data.slice(0, 30).forEach((row, i) => {
    if (row && row.length > 0) {
      console.log(`Row ${i + 1}:`, JSON.stringify(row));
    }
  });
});
