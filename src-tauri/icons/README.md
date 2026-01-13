# Icons Directory

Placeholder icons have been generated as SVG files. 

## Quick Setup

### Option 1: Install sharp and generate PNGs (Recommended)

```bash
pnpm install
pnpm generate-icons
```

This will generate all required PNG, ICO, and ICNS files.

### Option 2: Use existing SVGs

The SVG files can be used as-is for development, but Tauri requires PNG/ICO/ICNS for builds.

### Option 3: Manual conversion

1. Open each SVG file
2. Convert to PNG at the required sizes:
   - `32x32.png` (32x32 pixels)
   - `128x128.png` (128x128 pixels)
   - `128x128@2x.png` (256x256 pixels)
   - `icon.png` (256x256 pixels)
   - `icon.ico` (Windows icon, multiple sizes)
   - `icon.icns` (macOS icon bundle)

### Using ImageMagick

If you have ImageMagick installed:

```bash
cd src-tauri/icons
magick icon.svg -resize 32x32 32x32.png
magick icon.svg -resize 128x128 128x128.png
magick icon.svg -resize 256x256 128x128@2x.png
magick icon.svg -resize 256x256 icon.png
```

For ICO files (Windows):
```bash
magick icon.svg -resize 256x256 icon.ico
```

For ICNS files (macOS), you'll need additional tools like `iconutil` or online converters.

## Icon Design

The placeholder icons feature:
- Blue gradient background (#3b82f6 to #2563eb)
- White "M" letter in the center (for Market Toolbox)
- Rounded corners

You can customize the design by editing the SVG files or the generation scripts.
