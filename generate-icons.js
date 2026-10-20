const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create uncompressed PNG directly using pure Node.js buffer operations
function createPNG(size, outputPath) {
  // Minimal PNG generator
  // Signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: Width (4), Height (4), Bit depth (1), Color type (6 = RGBA), Compression (0), Filter (0), Interlace (0)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image raster data with scanline filter bytes
  const bytesPerPixel = 4;
  const scanlineLength = 1 + size * bytesPerPixel;
  const rawData = Buffer.alloc(size * scanlineLength);

  // Indigo theme color #6366f1 -> (99, 102, 241, 255)
  // Background darker indigo #4338ca -> (67, 56, 202, 255)
  for (let y = 0; y < size; y++) {
    const rowOffset = y * scanlineLength;
    rawData.writeUInt8(0, rowOffset); // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;

      // Draw a rounded-ish icon with 'B' or crosshair pattern
      const cx = size / 2;
      const cy = size / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const radius = size * 0.45;

      if (dist <= radius) {
        // Inner circle / gradient
        const isCrosshair = (Math.abs(x - cx) < size * 0.08 || Math.abs(y - cy) < size * 0.08);
        if (isCrosshair && dist > size * 0.15 && dist < size * 0.38) {
          // White crosshair mark
          rawData.writeUInt8(255, pxOffset);
          rawData.writeUInt8(255, pxOffset + 1);
          rawData.writeUInt8(255, pxOffset + 2);
          rawData.writeUInt8(255, pxOffset + 3);
        } else {
          // Indigo background
          rawData.writeUInt8(99, pxOffset);     // R
          rawData.writeUInt8(102, pxOffset + 1); // G
          rawData.writeUInt8(241, pxOffset + 2); // B
          rawData.writeUInt8(255, pxOffset + 3); // A
        }
      } else {
        // Transparent outside
        rawData.writeUInt8(0, pxOffset);
        rawData.writeUInt8(0, pxOffset + 1);
        rawData.writeUInt8(0, pxOffset + 2);
        rawData.writeUInt8(0, pxOffset + 3);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pngBuffer);
}

// CRC32 implementation for PNG chunks
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcInput);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[i] = c;
}

module.exports = { createPNG };

if (require.main === module) {
  const baseDir = path.join(__dirname, 'dist', 'icons');
  createPNG(16, path.join(baseDir, 'icon16.png'));
  createPNG(48, path.join(baseDir, 'icon48.png'));
  createPNG(128, path.join(baseDir, 'icon128.png'));
  console.log('PNG icons created successfully.');
}
