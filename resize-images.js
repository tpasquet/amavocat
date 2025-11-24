// Script pour redimensionner les images
// Installer sharp: npm install sharp --save-dev
// Exécuter: node resize-images.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = './src/assets/img/profile-picture-home.jpg';
const tempImage = './src/assets/img/profile-picture-home-temp.jpg';
const outputDir = './src/assets/img/';

const sizes = [
  { width: 350, suffix: '-350w' },
  { width: 525, suffix: '-525w' },
  { width: 700, suffix: '' } // Version optimisée pour remplacer l'original
];

async function resizeImages() {
  // First, copy original to temp file
  fs.copyFileSync(inputImage, tempImage);
  
  for (const size of sizes) {
    const outputPath = path.join(
      outputDir,
      `profile-picture-home${size.suffix}.jpg`
    );
    
    try {
      await sharp(tempImage)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`✓ Created ${outputPath} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`✗ Error creating ${outputPath}:`, error.message);
    }
  }
  
  // Delete temp file
  fs.unlinkSync(tempImage);
  
  
  console.log('\n✓ All images resized successfully!');
}

resizeImages();
