import fs from 'fs';
import path from 'path';

// Dimensiones del icono
const width = 32;
const height = 32;
const numPixels = width * height;
const pixelDataSize = numPixels * 4; // 32-bit BGRA
const andMaskRowBytes = Math.ceil(width / 32) * 4; // 4 bytes per row
const andMaskSize = andMaskRowBytes * height; // 128 bytes
const dibHeaderSize = 40;
const imageSize = dibHeaderSize + pixelDataSize + andMaskSize;

// Buffer para el archivo ICO completo
const icoBufferSize = 6 + 16 + imageSize;
const buf = Buffer.alloc(icoBufferSize);

// 1. Cabecera ICO (6 bytes)
buf.writeUInt16LE(0, 0); // Reservado
buf.writeUInt16LE(1, 2); // Tipo 1 = ICO
buf.writeUInt16LE(1, 4); // 1 imagen

// 2. Directorio ICO (16 bytes)
buf.writeUInt8(width, 6); // Ancho
buf.writeUInt8(height, 7); // Alto
buf.writeUInt8(0, 8); // Colores
buf.writeUInt8(0, 9); // Reservado
buf.writeUInt16LE(1, 10); // Planos de color
buf.writeUInt16LE(32, 12); // Bits por pixel
buf.writeUInt32LE(imageSize, 14); // Tamano de la imagen en bytes
buf.writeUInt32LE(22, 18); // Offset de la imagen (6 + 16 = 22)

// 3. BITMAPINFOHEADER (40 bytes)
let offset = 22;
buf.writeUInt32LE(40, offset); // biSize
buf.writeInt32LE(width, offset + 4); // biWidth
buf.writeInt32LE(height * 2, offset + 8); // biHeight (doble altura en ICO para mascara)
buf.writeUInt16LE(1, offset + 12); // biPlanes
buf.writeUInt16LE(32, offset + 14); // biBitCount (32-bit BGRA)
buf.writeUInt32LE(0, offset + 16); // biCompression (BI_RGB)
buf.writeUInt32LE(pixelDataSize, offset + 20); // biSizeImage
buf.writeInt32LE(0, offset + 24); // biXPelsPerMeter
buf.writeInt32LE(0, offset + 28); // biYPelsPerMeter
buf.writeUInt32LE(0, offset + 32); // biClrUsed
buf.writeUInt32LE(0, offset + 36); // biClrImportant
offset += 40;

// 4. Datos de pixeles (BGRA, de abajo hacia arriba)
// Disenamos un escudo azul zafiro con bordes dorados y centro blanco/oro
for (let y = height - 1; y >= 0; y--) {
  for (let x = 0; x < width; x++) {
    // Coordenadas relativas centradas
    const dx = x - 15.5;
    const dy = (31 - y) - 15.5; // Invertido para dibujar de arriba hacia abajo
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Forma squircle redondeada (radio ~14)
    const squircle = Math.pow(Math.abs(dx) / 14, 4) + Math.pow(Math.abs(dy) / 14, 4);

    let b = 0, g = 0, r = 0, a = 0;

    if (squircle <= 1.0) {
      a = 255;
      if (squircle > 0.82) {
        // Borde exterior celeste / dorado brillante
        b = 248; g = 189; r = 56; // #38bdf8
      } else {
        // Fondo azul institucional degradado
        const grad = (31 - y) / 32;
        r = Math.round(3 + grad * 10);
        g = Math.round(50 + grad * 50);
        b = Math.round(110 + grad * 80);

        // Escudo heráldico central
        const inShield = Math.abs(dx) <= 9 && (dy >= -8 && dy <= 10 - Math.abs(dx) * 0.8);
        if (inShield) {
          // Borde escudo
          const shieldBorder = Math.abs(dx) >= 8 || dy <= -7 || dy >= 8 - Math.abs(dx) * 0.8;
          if (shieldBorder) {
            r = 245; g = 158; b = 11; // Dorado #f59e0b
          } else {
            // Interior escudo: azul oscuro con llama blanca/oro
            r = 8; g = 30; b = 60;
            if (Math.abs(dx) <= 3 && dy >= -4 && dy <= 3) {
              // Llama / antorcha
              r = 254; g = 240; b = 138; // Oro claro #fef08a
              if (Math.abs(dx) <= 1 && dy >= -2 && dy <= 1) {
                r = 255; g = 255; b = 255; // Núcleo blanco
              }
            } else if (dy >= 4 && dy <= 6 && Math.abs(dx) <= 5) {
              // Monograma / barra
              r = 245; g = 158; b = 11;
            }
          }
        }
      }
    }

    buf.writeUInt8(b, offset);
    buf.writeUInt8(g, offset + 1);
    buf.writeUInt8(r, offset + 2);
    buf.writeUInt8(a, offset + 3);
    offset += 4;
  }
}

// 5. Mascara AND (1 bit por pixel, 0 = opaco, 1 = transparente)
for (let i = 0; i < andMaskSize; i++) {
  buf.writeUInt8(0, offset + i);
}

// Guardar en public/favicon.ico y src/app/favicon.ico
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), buf);
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'favicon.ico'), buf);
console.log('favicon.ico generado exitosamente en public/ y src/app/ (tamano: ' + buf.length + ' bytes)');
