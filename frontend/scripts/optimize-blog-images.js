const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, '../public/Bilder_kvinnor boken_2025');
const OUTPUT_DIR = path.join(__dirname, '../public/images/blog');

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Output directory ready: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Error creating output directory:', error);
  }
}

// Optimize a single image
async function optimizeImage(filename) {
  const inputPath = path.join(SOURCE_DIR, filename);
  const outputFilename = filename.toLowerCase().replace(/\s+/g, '-').replace('.png', '.jpg');
  const outputPath = path.join(OUTPUT_DIR, outputFilename);
  
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`Processing ${filename} (${metadata.width}x${metadata.height})...`);
    
    // Create optimized versions
    // Full size for blog post pages (max 1200px wide)
    await sharp(inputPath)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(outputPath);
    
    // Thumbnail for blog list (600px wide)
    const thumbPath = path.join(OUTPUT_DIR, `thumb-${outputFilename}`);
    await sharp(inputPath)
      .resize(600, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toFile(thumbPath);
    
    // Get file sizes
    const originalSize = (await fs.stat(inputPath)).size;
    const optimizedSize = (await fs.stat(outputPath)).size;
    const thumbSize = (await fs.stat(thumbPath)).size;
    
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${filename} optimized:`);
    console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);
    console.log(`   Thumbnail: ${(thumbSize / 1024).toFixed(0)}KB`);
    console.log(`   Output: ${outputFilename}`);
    
    return {
      original: filename,
      optimized: outputFilename,
      thumbnail: `thumb-${outputFilename}`,
      originalSize,
      optimizedSize,
      thumbSize
    };
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
    return null;
  }
}

// Main function
async function optimizeAllImages() {
  console.log('🖼️  Starting blog image optimization...\n');
  
  await ensureOutputDir();
  
  try {
    // Get all PNG files
    const files = await fs.readdir(SOURCE_DIR);
    const imageFiles = files.filter(f => f.endsWith('.png') && f.startsWith('Kapitel'));
    
    console.log(`Found ${imageFiles.length} images to optimize\n`);
    
    // Process all images
    const results = [];
    for (const file of imageFiles) {
      const result = await optimizeImage(file);
      if (result) results.push(result);
    }
    
    // Summary
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalThumbs = results.reduce((sum, r) => sum + r.thumbSize, 0);
    const totalSavings = ((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1);
    
    console.log('\n📊 Optimization Summary:');
    console.log(`   Total images: ${results.length}`);
    console.log(`   Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Thumbnails total: ${(totalThumbs / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Total savings: ${totalSavings}%`);
    
    // Create mapping file
    const mapping = results.map(r => ({
      chapter: parseInt(r.original.match(/\d+/)[0]),
      image: r.optimized,
      thumbnail: r.thumbnail
    })).sort((a, b) => a.chapter - b.chapter);
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'blog-images-mapping.json'),
      JSON.stringify(mapping, null, 2)
    );
    
    console.log('\n✅ Image optimization complete!');
    console.log(`📁 Images saved to: ${OUTPUT_DIR}`);
    console.log(`📋 Mapping saved to: ${path.join(OUTPUT_DIR, 'blog-images-mapping.json')}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the optimization
optimizeAllImages(); 