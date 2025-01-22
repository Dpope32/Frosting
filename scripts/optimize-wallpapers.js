const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WALLPAPERS_DIR = path.join(__dirname, '../assets/wallpapers');
const OPTIMIZED_DIR = path.join(__dirname, '../assets/wallpapers-optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(OPTIMIZED_DIR)) {
  fs.mkdirSync(OPTIMIZED_DIR);
}

async function optimizeImage(filename) {
  const inputPath = path.join(WALLPAPERS_DIR, filename);
  const outputPath = path.join(OPTIMIZED_DIR, filename.replace('.png', '.jpg'));
  
  try {
    await sharp(inputPath)
      .resize(1920, 1080, { // Resize to standard FHD resolution
        fit: 'cover',
        withoutEnlargement: true
      })
      .jpeg({ // Convert to JPEG with good quality
        quality: 85,
        progressive: true
      })
      .toFile(outputPath);
    
    console.log(`✓ Optimized: ${filename}`);
    
    // Log size reduction
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Reduced by: ${reduction}%\n`);
    
    return outputPath;
  } catch (error) {
    console.error(`✗ Error optimizing ${filename}:`, error);
    return null;
  }
}

async function optimizeAllWallpapers() {
  console.log('Starting wallpaper optimization...\n');
  
  const files = fs.readdirSync(WALLPAPERS_DIR)
    .filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
  
  for (const file of files) {
    await optimizeImage(file);
  }
  
  console.log('Optimization complete!');
}

// Run the optimization
optimizeAllWallpapers().catch(console.error);
