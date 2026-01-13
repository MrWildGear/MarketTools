// Alternative simple script using Canvas API (requires node-canvas)
// If sharp doesn't work, you can use this version

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../src-tauri/icons');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#2563eb');
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, size, size, size * 0.125);
  ctx.fill();

  // Draw "E" letter
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

function generateIcons() {
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  const sizes = [32, 128, 256];

  sizes.forEach((size) => {
    const buffer = generateIcon(size);
    fs.writeFileSync(path.join(iconDir, `${size}x${size}.png`), buffer);
    console.log(`Generated ${size}x${size}.png`);
  });

  // Generate @2x
  const buffer2x = generateIcon(256);
  fs.writeFileSync(path.join(iconDir, '128x128@2x.png'), buffer2x);
  console.log(`Generated 128x128@2x.png`);

  // Generate main icon
  const mainIcon = generateIcon(256);
  fs.writeFileSync(path.join(iconDir, 'icon.png'), mainIcon);
  fs.writeFileSync(path.join(iconDir, 'icon.ico'), mainIcon); // Placeholder
  fs.writeFileSync(path.join(iconDir, 'icon.icns'), mainIcon); // Placeholder
  console.log(`Generated main icons`);

  console.log('\n✅ All placeholder icons generated!');
}

if (require.main === module) {
  try {
    generateIcons();
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('\nNote: This script requires node-canvas. Install with:');
    console.log('pnpm add -D canvas');
  }
}

module.exports = { generateIcons };
