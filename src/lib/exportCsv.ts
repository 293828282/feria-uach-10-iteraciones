// UTF-8 BOM CSV Export Utility for Excel and Academic Reports

import { StandEvaluationSummary } from '@/types/database';

export function exportRankingsToCSV(rankings: StandEvaluationSummary[]) {
  if (!rankings || rankings.length === 0) return;

  const headers = [
    'Posición',
    'Número de Stand',
    'Nombre del Proyecto / Stand',
    'Categoría',
    'Puntaje Ponderado Final',
    'Puntaje Promedio Simple',
    'Votos Computados',
    'Jurados',
  ];

  const rows = rankings.map((r, idx) => [
    idx + 1,
    r.stand.stand_number,
    `"${r.stand.project_name.replace(/"/g, '""')}"`,
    `"${(r.stand.category || 'General').replace(/"/g, '""')}"`,
    r.weightedScore.toFixed(2),
    r.rawAverage.toFixed(2),
    r.evaluationsCount,
    r.judgesCount,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ranking_oficial_feria_uach_2026_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
