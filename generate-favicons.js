const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = './src/favicon.svg';
const outputDir = './src/assets/icons/';

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' }
];

async function generateFavicons() {
  console.log('🎨 Génération des favicons...\n');
  
  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(outputDir, name);
      
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`✓ ${name} (${size}x${size}) - ${Math.round(stats.size / 1024)}KB`);
    } catch (error) {
      console.error(`✗ Erreur pour ${name}:`, error.message);
    }
  }
  
  console.log('\n✓ Tous les favicons ont été générés avec succès!');
}

generateFavicons();