const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sourceDir = path.join(__dirname, '../public/Bilder_kvinnor boken_2025')
const targetDir = path.join(__dirname, '../public/images/blog')

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

const optimizeImages = async () => {
  try {
    const files = fs.readdirSync(sourceDir)
    const imageFiles = files.filter(file => 
      file.toLowerCase().startsWith('kapitel') && 
      (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg'))
    )
    
    console.log(`Found ${imageFiles.length} images to optimize`)
    
    const mapping = {}
    
    for (const file of imageFiles) {
      const sourcePath = path.join(sourceDir, file)
      const baseName = path.parse(file).name.toLowerCase().replace(/\s+/g, '-')
      
      console.log(`Processing: ${file}`)
      
      // Generate full size image (1200px width, JPEG)
      const fullOutputPath = path.join(targetDir, `${baseName}.jpg`)
      await sharp(sourcePath)
        .resize(1200, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toFile(fullOutputPath)
      
      // Generate thumbnail (600x400, JPEG)
      const thumbnailOutputPath = path.join(targetDir, `${baseName}-thumb.jpg`)
      await sharp(sourcePath)
        .resize(600, 400, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 80,
          progressive: true 
        })
        .toFile(thumbnailOutputPath)
      
      // Add to mapping
      mapping[baseName] = {
        original: file,
        full: `/images/blog/${baseName}.jpg`,
        thumbnail: `/images/blog/${baseName}-thumb.jpg`
      }
      
      console.log(`✓ Optimized: ${file}`)
    }
    
    // Save mapping file
    const mappingPath = path.join(targetDir, 'blog-images-mapping.json')
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2))
    
    console.log(`\n✅ Successfully optimized ${imageFiles.length} images`)
    console.log(`📁 Images saved to: ${targetDir}`)
    console.log(`📋 Mapping saved to: ${mappingPath}`)
    
    // Calculate total size reduction
    let originalSize = 0
    let optimizedSize = 0
    
    for (const file of imageFiles) {
      const sourcePath = path.join(sourceDir, file)
      const baseName = path.parse(file).name.toLowerCase().replace(/\s+/g, '-')
      const fullPath = path.join(targetDir, `${baseName}.jpg`)
      const thumbPath = path.join(targetDir, `${baseName}-thumb.jpg`)
      
      originalSize += fs.statSync(sourcePath).size
      optimizedSize += fs.statSync(fullPath).size
      optimizedSize += fs.statSync(thumbPath).size
    }
    
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)
    console.log(`💾 Size reduction: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(optimizedSize / 1024 / 1024).toFixed(1)}MB (${reduction}% reduction)`)
    
  } catch (error) {
    console.error('❌ Error optimizing images:', error)
    process.exit(1)
  }
}

optimizeImages() 