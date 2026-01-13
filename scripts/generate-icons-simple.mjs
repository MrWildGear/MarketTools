// Simple script to generate placeholder SVG icons (no dependencies required)
// These can be converted to PNG/ICO/ICNS later

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconDir = path.join(__dirname, '../src-tauri/icons');

// Create SVG icon template
function createSVGIcon(size) {
  const fontSize = Math.floor(size * 0.7);
  const textY = Math.floor(size * 0.7);
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.125)}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="middle">E</text>
</svg>`;
}

async function generateIcons() {
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  const sizes = [32, 128, 256];

  // Generate SVG icons (can be converted to PNG later)
  for (const size of sizes) {
    const svg = createSVGIcon(size);
    fs.writeFileSync(path.join(iconDir, `${size}x${size}.svg`), svg);
    console.log(`Generated ${size}x${size}.svg`);
  }

  // Generate @2x version
  const svg2x = createSVGIcon(256);
  fs.writeFileSync(path.join(iconDir, '128x128@2x.svg'), svg2x);
  console.log(`Generated 128x128@2x.svg`);

  // Generate main icon
  const mainIcon = createSVGIcon(256);
  fs.writeFileSync(path.join(iconDir, 'icon.svg'), mainIcon);
  console.log(`Generated icon.svg`);

  // Generate square logos for Windows Store
  const squareSizes = [30, 44, 71, 89, 107, 142, 150, 284, 310];
  for (const size of squareSizes) {
    const svg = createSVGIcon(size);
    fs.writeFileSync(path.join(iconDir, `Square${size}x${size}Logo.svg`), svg);
  }
  console.log(`Generated square logos`);

  console.log('\n✅ SVG placeholder icons generated!');
  console.log('\nNote: You can convert SVG to PNG/ICO/ICNS using:');
  console.log('  - Online tools (like cloudconvert.com)');
  console.log('  - ImageMagick: magick icon.svg -resize 256x256 icon.png');
  console.log('  - Or install sharp and run: pnpm generate-icons');
}

generateIcons().catch(console.error);
