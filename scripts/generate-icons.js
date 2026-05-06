const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/static/icons');

const createSimplePNG = (width, height, r, g, b, a = 255) => {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a);
    }
  }
  
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressedData);
  
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
};

const createChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
};

const crc32 = (buf) => {
  let crc = 0xFFFFFFFF;
  const table = [];
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return crc ^ 0xFFFFFFFF;
};

const icons = [
  { name: 'home.png', color: [143, 143, 148] },
  { name: 'home-active.png', color: [74, 158, 255] },
  { name: 'record.png', color: [143, 143, 148] },
  { name: 'record-active.png', color: [74, 158, 255] },
  { name: 'tournament.png', color: [143, 143, 148] },
  { name: 'tournament-active.png', color: [74, 158, 255] },
  { name: 'profile.png', color: [143, 143, 148] },
  { name: 'profile-active.png', color: [74, 158, 255] },
];

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

icons.forEach(({ name, color }) => {
  const png = createSimplePNG(48, 48, color[0], color[1], color[2]);
  fs.writeFileSync(path.join(iconsDir, name), png);
  console.log(`Created ${name}`);
});

console.log('All icons created successfully!');
