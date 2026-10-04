import { StandEvaluationSummary, EvaluationCriteria } from '@/types/database';

interface ExportWordOptions {
  totalEvaluations?: number;
  totalJudges?: number;
  globalAverage?: number;
  consensusRate?: number;
  standardDeviation?: number;
}

function getStandImage(standNumber: string): string {
  const clean = standNumber.replace(/\D/g, '').padStart(2, '0');
  const valid = ['01', '02', '03', '04', '05', '06'];
  return valid.includes(clean) ? `/stands/stand-${clean}.jpg` : '/stands/stand-01.jpg';
}

/**
 * Convierte una imagen (URL relativa, HTTP o Data URI) a Base64 puro sin encabezado.
 */
async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    if (!url) return null;

    // Si ya es data URI
    if (url.startsWith('data:')) {
      const match = url.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], base64: match[2] };
      }
    }

    // Si es relativa, anteponer el origen en el navegador
    let fullUrl = url;
    if (url.startsWith('/') && typeof window !== 'undefined') {
      fullUrl = window.location.origin + url;
    }

    const res = await fetch(fullUrl);
    if (!res.ok) return null;
    const blob = await res.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
        if (match) {
          resolve({ mimeType: match[1], base64: match[2] });
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Error fetching image for Word export:', err);
    return null;
  }
}

/**
 * Genera y descarga el Acta Oficial de Ganadores del Podio en formato Microsoft Word (.doc)
 * utilizando el estándar MHTML (MIME Encapsulation multipart/related), lo que garantiza
 * que Microsoft Word descargue y muestre las fotografías de los stands incrustadas de forma
 * 100% nativa y sin enlaces rotos ni dependencias de internet.
 */
export async function exportPodiumToWord(
  rankings: StandEvaluationSummary[],
  criteria: EvaluationCriteria[],
  options: ExportWordOptions = {}
): Promise<void> {
  const boundary = '----=_NextPart_UAChFeria2026_MHTML_Boundary';
  const currentDate = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const podiumStands = rankings.slice(0, 3);

  // Recopilar y codificar las imágenes de los stands del podio
  const embeddedImages: Array<{
    location: string;
    mimeType: string;
    base64: string;
  }> = [];

  for (let i = 0; i < podiumStands.length; i++) {
    const summary = podiumStands[i];
    const rawImg = summary.stand.image_url || getStandImage(summary.stand.stand_number);
    const converted = await fetchImageAsBase64(rawImg);
    if (converted) {
      const location = `stand_winner_photo_${i + 1}.jpg`;
      embeddedImages.push({
        location,
        mimeType: converted.mimeType || 'image/jpeg',
        base64: converted.base64,
      });
    }
  }

  // Estructura HTML para Microsoft Word
  const htmlBody = `
<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Acta Oficial de Ganadores - Feria UACh 2026</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    size: 21.59cm 27.94cm; /* Carta */
    margin: 2.0cm 2.0cm 2.0cm 2.0cm;
    mso-header-margin: 1.0cm;
    mso-footer-margin: 1.0cm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    line-height: 1.35;
    color: #0f172a;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
  }
  .header-institution {
    text-align: center;
    border-bottom: 2pt solid #0284c7;
    padding-bottom: 12pt;
    margin-bottom: 18pt;
  }
  .inst-title {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    color: #0c4a6e;
    margin: 0 0 3pt 0;
  }
  .inst-sub {
    font-size: 10pt;
    font-style: italic;
    color: #475569;
    margin: 0 0 2pt 0;
  }
  .doc-title {
    font-size: 16pt;
    font-weight: bold;
    color: #0f172a;
    text-align: center;
    margin: 16pt 0 4pt 0;
    text-transform: uppercase;
  }
  .doc-subtitle {
    font-size: 10.5pt;
    text-align: center;
    color: #0369a1;
    font-weight: bold;
    margin: 0 0 16pt 0;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18pt;
  }
  .meta-table td {
    padding: 5pt 8pt;
    font-size: 9.5pt;
    border: 0.5pt solid #cbd5e1;
    background-color: #f8fafc;
  }
  .section-heading {
    font-size: 13pt;
    font-weight: bold;
    color: #0284c7;
    border-bottom: 1pt solid #cbd5e1;
    padding-bottom: 3pt;
    margin-top: 18pt;
    margin-bottom: 10pt;
    text-transform: uppercase;
  }
  .podium-box {
    border: 1.5pt solid #cbd5e1;
    border-radius: 6pt;
    padding: 12pt;
    margin-bottom: 16pt;
    background-color: #ffffff;
    page-break-inside: avoid;
  }
  .podium-gold {
    border-color: #f59e0b;
    background-color: #fffbeb;
  }
  .podium-silver {
    border-color: #94a3b8;
    background-color: #f8fafc;
  }
  .podium-bronze {
    border-color: #ea580c;
    background-color: #fff7ed;
  }
  .badge-tag {
    display: inline-block;
    padding: 3pt 8pt;
    font-size: 9pt;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 3pt;
    margin-bottom: 6pt;
  }
  .tag-gold { background-color: #f59e0b; color: #ffffff; }
  .tag-silver { background-color: #64748b; color: #ffffff; }
  .tag-bronze { background-color: #ea580c; color: #ffffff; }
  .project-title {
    font-size: 14pt;
    font-weight: bold;
    color: #0f172a;
    margin: 4pt 0;
  }
  .project-team {
    font-size: 10pt;
    color: #475569;
    margin-bottom: 8pt;
  }
  .stand-photo-wrapper {
    text-align: center;
    margin: 10pt 0;
  }
  .stand-photo {
    width: 480px;
    max-width: 100%;
    height: auto;
    border: 1pt solid #cbd5e1;
    border-radius: 4pt;
  }
  .score-badge {
    font-size: 12pt;
    font-weight: bold;
    color: #0f172a;
    background-color: #e2e8f0;
    padding: 3pt 8pt;
    display: inline-block;
    border-radius: 3pt;
  }
  .table-rankings {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10pt;
    margin-bottom: 20pt;
  }
  .table-rankings th {
    background-color: #0f172a;
    color: #ffffff;
    font-size: 9pt;
    font-weight: bold;
    padding: 6pt 5pt;
    border: 0.5pt solid #334155;
    text-align: center;
  }
  .table-rankings td {
    font-size: 9pt;
    padding: 5pt 5pt;
    border: 0.5pt solid #cbd5e1;
    text-align: center;
  }
  .table-rankings td.text-left {
    text-align: left;
  }
  .table-rankings tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .signature-table {
    width: 100%;
    margin-top: 36pt;
    border-collapse: collapse;
  }
  .signature-table td {
    width: 50%;
    text-align: center;
    vertical-align: top;
    padding: 10pt;
    border: none;
  }
  .sig-line {
    width: 70%;
    margin: 0 auto;
    border-top: 1pt solid #0f172a;
    padding-top: 4pt;
    font-weight: bold;
    font-size: 10pt;
  }
  .sig-role {
    font-size: 8.5pt;
    color: #64748b;
  }
</style>
</head>
<body>

  <!-- Institución Header -->
  <div class="header-institution">
    <div class="inst-title">Universidad Austral de Chile</div>
    <div class="inst-sub">Facultad de Ciencias Económicas y Administrativas &bull; Escuela de Graduados</div>
    <div class="inst-sub">Sede Puerto Montt &bull; Región de Los Lagos</div>
  </div>

  <div class="doc-title">Acta Oficial de Ganadores y Cierre de Certamen</div>
  <div class="doc-subtitle">Feria de Emprendimiento e Innovación UACh 2026</div>

  <!-- Metadatos de la Ceremonia -->
  <table class="meta-table">
    <tr>
      <td><strong>Fecha de Emisión:</strong> ${currentDate}</td>
      <td><strong>Hora de Emisión:</strong> ${currentTime} hrs</td>
    </tr>
    <tr>
      <td><strong>Sede y Ubicación:</strong> Sede Puerto Montt, Los Lagos</td>
      <td><strong>Votos / Notas Computadas:</strong> ${options.totalEvaluations ?? '---'}</td>
    </tr>
    <tr>
      <td><strong>Cuerpo de Jurados:</strong> ${options.totalJudges ?? '---'} evaluadores oficiales</td>
      <td><strong>Promedio General Feria:</strong> ${options.globalAverage ? options.globalAverage.toFixed(2) + ' / 7.00' : '---'}</td>
    </tr>
  </table>

  <!-- Sección de Ganadores del Podio -->
  <div class="section-heading">Podio Oficial de Honor (Primeros Lugares)</div>

  ${podiumStands
    .map((summary, idx) => {
      const stand = summary.stand;
      const rankName = idx === 0 ? '1° Lugar &bull; Medalla de Oro' : idx === 1 ? '2° Lugar &bull; Medalla de Plata' : '3° Lugar &bull; Medalla de Bronce';
      const boxClass = idx === 0 ? 'podium-gold' : idx === 1 ? 'podium-silver' : 'podium-bronze';
      const tagClass = idx === 0 ? 'tag-gold' : idx === 1 ? 'tag-silver' : 'tag-bronze';
      const photoName = `stand_winner_photo_${idx + 1}.jpg`;
      const hasPhoto = embeddedImages.some((img) => img.location === photoName);

      return `
  <div class="podium-box ${boxClass}">
    <span class="badge-tag ${tagClass}">${rankName}</span>
    <div class="project-title">${stand.project_name} &bull; STAND #${stand.stand_number}</div>
    <div class="project-team"><strong>Equipo / Autores:</strong> ${stand.team_members}</div>
    <div style="font-size: 9.5pt; color: #475569; margin-bottom: 6pt;">
      <strong>Categoría:</strong> ${stand.category || 'General'} &bull; 
      <strong>Calificación Ponderada Final:</strong> <span class="score-badge">${summary.weightedScore.toFixed(2)} pts</span> (Escala 1.0 a 7.0)
    </div>

    ${
      hasPhoto
        ? `
    <div class="stand-photo-wrapper">
      <img src="${photoName}" class="stand-photo" alt="${stand.project_name}" />
      <div style="font-size: 8pt; color: #64748b; font-style: italic; margin-top: 3pt;">
        Fotografía oficial del stand y prototipo de emprendimiento &bull; UACh Sede Puerto Montt
      </div>
    </div>`
        : ''
    }

    <div style="font-size: 10pt; margin-top: 6pt; line-height: 1.4;">
      <strong>Emprendimiento y Propuesta de Valor:</strong> Proyecto de innovación presentado por ${stand.team_members} en la categoría de ${stand.category || 'Emprendimiento e Innovación'}.
    </div>

    ${
      summary.feedbacks && summary.feedbacks.length > 0
        ? `
    <div style="margin-top: 8pt; padding: 6pt 8pt; background-color: #ffffff; border-left: 3pt solid #0284c7; font-size: 9pt;">
      <strong>Observaciones de los Jurados:</strong><br />
      ${summary.feedbacks.map((fb) => `&bull; <em>"${fb}"</em>`).join('<br />')}
    </div>`
        : ''
    }
  </div>
  `;
    })
    .join('')}

  <!-- Cuadro General de Ponderación -->
  <div class="section-heading" style="margin-top: 24pt;">Tabla Completa de Calificaciones y Desglose</div>
  <table class="table-rankings">
    <thead>
      <tr>
        <th style="width: 30pt;">Pos</th>
        <th style="width: 45pt;">Stand</th>
        <th>Proyecto / Emprendimiento</th>
        <th style="width: 70pt;">Categoría</th>
        ${criteria.map((c) => `<th style="width: 50pt;">${c.question_text.substring(0, 14)}...</th>`).join('')}
        <th style="width: 55pt;">Nota Final</th>
      </tr>
    </thead>
    <tbody>
      ${rankings
        .map((r, idx) => {
          return `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td>#${r.stand.stand_number}</td>
        <td class="text-left"><strong>${r.stand.project_name}</strong><br /><span style="font-size: 7.5pt; color: #64748b;">${r.stand.team_members}</span></td>
        <td>${r.stand.category || 'General'}</td>
        ${criteria
          .map((c) => {
            const score = r.criteriaScores[c.id];
            return `<td>${score !== undefined ? score.toFixed(2) : '-'}</td>`;
          })
          .join('')}
        <td><strong>${r.weightedScore.toFixed(2)}</strong></td>
      </tr>
          `;
        })
        .join('')}
    </tbody>
  </table>

  <!-- Fe de Hechos y Firmas Institucionales -->
  <table class="signature-table">
    <tr>
      <td>
        <div style="height: 45pt;"></div>
        <div class="sig-line">Comisión Evaluadora y Jurados</div>
        <div class="sig-role">Feria de Emprendimiento UACh 2026<br />Sede Puerto Montt</div>
      </td>
      <td>
        <div style="height: 45pt;"></div>
        <div class="sig-line">Dirección Académica / Decanatura</div>
        <div class="sig-role">Facultad de Ciencias Económicas y Administrativas<br />Universidad Austral de Chile</div>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();

  // Armar el contenedor MHTML multipart/related
  let mhtml = `MIME-Version: 1.0\r\n`;
  mhtml += `Content-Type: multipart/related; boundary="${boundary}"; type="text/html"\r\n\r\n`;

  // Parte 1: Documento HTML
  mhtml += `--${boundary}\r\n`;
  mhtml += `Content-Type: text/html; charset="utf-8"\r\n`;
  mhtml += `Content-Transfer-Encoding: 8bit\r\n`;
  mhtml += `Content-Location: index.html\r\n\r\n`;
  mhtml += htmlBody;
  mhtml += `\r\n\r\n`;

  // Partes 2 a N: Imágenes de los stands incrustadas
  for (const img of embeddedImages) {
    mhtml += `--${boundary}\r\n`;
    mhtml += `Content-Type: ${img.mimeType}\r\n`;
    mhtml += `Content-Transfer-Encoding: base64\r\n`;
    mhtml += `Content-Location: ${img.location}\r\n\r\n`;
    mhtml += img.base64;
    mhtml += `\r\n\r\n`;
  }

  // Cierre del boundary
  mhtml += `--${boundary}--\r\n`;

  // Descargar el archivo con extensión .doc para que Word lo abra con 100% fidelidad
  const blob = new Blob([mhtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Acta_Oficial_Podio_Feria_UACh_2026.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
