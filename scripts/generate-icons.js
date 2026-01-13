// Simple script to generate placeholder icons for Market Toolbox
// Requires: sharp package (install with: pnpm install -D sharp)
// Then run: pnpm generate-icons

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import toIco from 'to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconDir = path.join(__dirname, '../src-tauri/icons');
const sizes = [32, 128, 256];

// Create SVG icon (simple square with "M" for Market Toolbox)
const svgIcon = `
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#3b82f6" rx="32"/>
  <text x="128" y="180" font-family="Arial, sans-serif" font-size="180" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="middle">M</text>
</svg>`;

async function generateIcons() {
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  // Generate PNG icons
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `${size}x${size}.png`));
    console.log(`Generated ${size}x${size}.png`);

    // Generate @2x version for 128x128
    if (size === 128) {
      await sharp(Buffer.from(svgIcon))
        .resize(256, 256)
        .png()
        .toFile(path.join(iconDir, '128x128@2x.png'));
      console.log(`Generated 128x128@2x.png`);
    }
  }

  // Generate main icon.png (256x256)
  await sharp(Buffer.from(svgIcon))
    .resize(256, 256)
    .png()
    .toFile(path.join(iconDir, 'icon.png'));
  console.log(`Generated icon.png`);

  // Generate ICO file for Windows (multi-size ICO)
  const icoSizes = [16, 32, 48, 256];
  const icoBuffers = [];
  for (const size of icoSizes) {
    const buffer = await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toBuffer();
    icoBuffers.push(buffer);
  }
  
  const icoFile = await toIco(icoBuffers);
  fs.writeFileSync(path.join(iconDir, 'icon.ico'), icoFile);
  console.log(`Generated icon.ico`);

  // Generate ICNS for macOS - use PNG format for now
  // Proper ICNS requires macOS-specific tools (iconutil) or libraries
  const icns512 = await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(iconDir, 'icon.icns'), icns512);
  console.log(`Generated icon.icns (PNG placeholder - convert to ICNS for production)`);

  // Generate square logos for Windows Store
  const squareSizes = [30, 44, 71, 89, 107, 142, 150, 284, 310];
  for (const size of squareSizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `Square${size}x${size}Logo.png`));
  }
  console.log(`Generated square logos`);

  console.log('\n✅ All placeholder icons generated!');
}

generateIcons().catch(console.error);
