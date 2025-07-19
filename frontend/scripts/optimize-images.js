const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration for different image types
const CONFIG = {
  jpeg: {
    quality: 80,
    progressive: true,
    mozjpeg: true
  },
  png: {
    quality: 85,
    compressionLevel: 8,
    progressive: true
  },
  webp: {
    quality: 85,
    effort: 6
  }
};

// Size limits (in bytes)
const SIZE_LIMITS = {
  large: 2 * 1024 * 1024,    // 2MB - aggressive compression
  medium: 1 * 1024 * 1024,   // 1MB - moderate compression  
  small: 500 * 1024,         // 500KB - light compression
};

async function getFileSize(filePath) {
  const stats = await fs.promises.stat(filePath);
  return stats.size;
}

async function optimizeImage(inputPath, outputPath) {
  const originalSize = await getFileSize(inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  
  console.log(`\n🔧 Optimizing: ${path.basename(inputPath)}`);
  console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
  
  let image = sharp(inputPath);
  
  // Get image metadata
  const metadata = await image.metadata();
  console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);
  
  // Resize if too large
  if (metadata.width > 1920) {
    image = image.resize(1920, null, { 
      withoutEnlargement: true,
      fit: 'inside'
    });
    console.log(`   ⚠️  Resized to max width 1920px`);
  }
  
  // Apply compression based on file size and type
  if (ext === '.jpg' || ext === '.jpeg') {
    let quality = CONFIG.jpeg.quality;
    
    if (originalSize > SIZE_LIMITS.large) {
      quality = 70; // Aggressive compression for large files
    } else if (originalSize > SIZE_LIMITS.medium) {
      quality = 75; // Moderate compression
    }
    
    image = image.jpeg({
      quality,
      progressive: CONFIG.jpeg.progressive,
      mozjpeg: CONFIG.jpeg.mozjpeg
    });
    
    console.log(`   📉 JPEG quality: ${quality}%`);
    
  } else if (ext === '.png') {
    let quality = CONFIG.png.quality;
    
    if (originalSize > SIZE_LIMITS.large) {
      quality = 70;
    } else if (originalSize > SIZE_LIMITS.medium) {
      quality = 80;
    }
    
    image = image.png({
      quality,
      compressionLevel: CONFIG.png.compressionLevel,
      progressive: CONFIG.png.progressive
    });
    
    console.log(`   📉 PNG quality: ${quality}%`);
  }
  
  // Save optimized image to temporary file first
  const tempPath = outputPath + '.temp';
  await image.toFile(tempPath);
  
  // Replace original with optimized version
  await fs.promises.unlink(outputPath);
  await fs.promises.rename(tempPath, outputPath);
  
  const newSize = await getFileSize(outputPath);
  const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
  
  console.log(`   ✅ New size: ${(newSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   💾 Saved: ${savings}% (${((originalSize - newSize) / 1024 / 1024).toFixed(2)}MB)`);
  
  return {
    originalSize,
    newSize,
    savings: parseFloat(savings)
  };
}

async function findImages(dir, images = []) {
  const files = await fs.promises.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);
    
    if (stat.isDirectory()) {
      await findImages(filePath, images);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        images.push(filePath);
      }
    }
  }
  
  return images;
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  
  const publicDir = path.join(__dirname, '../public');
  const backupDir = path.join(__dirname, '../image-backups');
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}\n`);
  }
  
  try {
    const images = await findImages(publicDir);
    console.log(`📸 Found ${images.length} images to optimize\n`);
    
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let optimizedCount = 0;
    
    for (const imagePath of images) {
      try {
        // Create backup
        const relativePath = path.relative(publicDir, imagePath);
        const backupPath = path.join(backupDir, relativePath);
        const backupDirPath = path.dirname(backupPath);
        
        if (!fs.existsSync(backupDirPath)) {
          fs.mkdirSync(backupDirPath, { recursive: true });
        }
        
        await fs.promises.copyFile(imagePath, backupPath);
        
        // Optimize image
        const result = await optimizeImage(imagePath, imagePath);
        
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
        optimizedCount++;
        
      } catch (error) {
        console.error(`❌ Error optimizing ${imagePath}:`, error.message);
      }
    }
    
    // Summary
    const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 OPTIMIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Images optimized: ${optimizedCount}/${images.length}`);
    console.log(`📉 Original total size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📈 New total size: ${(totalNewSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`💾 Total saved: ${totalSavings}% (${((totalOriginalSize - totalNewSize) / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`🗂️  Backups saved to: ${backupDir}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { optimizeImage, findImages }; 