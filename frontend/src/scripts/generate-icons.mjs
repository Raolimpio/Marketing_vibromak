import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [192, 512];
const inputSvg = path.resolve('public', 'app-icon.svg');
const outputDir = path.resolve('public');

async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputFile);
      
    console.log(`Generated ${outputFile}`);
  }
}

generateIcons().catch(console.error);
