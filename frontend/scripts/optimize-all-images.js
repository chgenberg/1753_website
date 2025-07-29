const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const IMAGE_DIRS = [
  './public/images',
  './public/Ingredienser', 
  './public/Mushrooms',
  './public/Cannabis',
  './public/Porträtt'
]

const OPTIMIZATION_CONFIG = {
  jpeg: { quality: 85, progressive: true },
  png: { quality: 85, compressionLevel: 8 },
  webp: { quality: 85 }
}

async function optimizeImage(inputPath, outputPath, format = 'original') {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    // Skip if already optimized (check file size vs dimensions)
    const stats = fs.statSync(inputPath)
    const sizePerPixel = stats.size / (metadata.width * metadata.height)
    
    if (sizePerPixel < 0.5 && format === 'original') {
      console.log(`⏭️  Skipping ${path.basename(inputPath)} (already optimized)`)
      return { skipped: true, originalSize: stats.size }
    }

    let pipeline = image
    
    // Resize if too large
    if (metadata.width > 1920) {
      pipeline = pipeline.resize(1920, null, { withoutEnlargement: true })
    }
    
    // Apply format-specific optimization
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp(OPTIMIZATION_CONFIG.webp)
        outputPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        break
      case 'jpeg':
        pipeline = pipeline.jpeg(OPTIMIZATION_CONFIG.jpeg)
        break
      case 'png':
        pipeline = pipeline.png(OPTIMIZATION_CONFIG.png)
        break
      default:
        // Keep original format but optimize
        if (metadata.format === 'jpeg') {
          pipeline = pipeline.jpeg(OPTIMIZATION_CONFIG.jpeg)
        } else if (metadata.format === 'png') {
          pipeline = pipeline.png(OPTIMIZATION_CONFIG.png)
        }
    }
    
    await pipeline.toFile(outputPath)
    
    const newStats = fs.statSync(outputPath)
    const savedBytes = stats.size - newStats.size
    const savedPercent = ((savedBytes / stats.size) * 100).toFixed(1)
    
    return {
      originalSize: stats.size,
      newSize: newStats.size,
      savedBytes,
      savedPercent,
      format: format === 'original' ? metadata.format : format
    }
    
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message)
    return { error: error.message }
  }
}

async function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`)
    return
  }
  
  console.log(`\n📁 Processing directory: ${dir}`)
  
  const files = fs.readdirSync(dir, { withFileTypes: true })
  let totalSaved = 0
  let processedCount = 0
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    
    if (file.isDirectory()) {
      await processDirectory(fullPath)
      continue
    }
    
    // Only process image files
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      continue
    }
    
    console.log(`🔄 Processing: ${file.name}`)
    
    // Create optimized version
    const result = await optimizeImage(fullPath, fullPath, 'original')
    
    if (result.skipped) {
      console.log(`   Already optimized`)
    } else if (result.error) {
      console.log(`   Error: ${result.error}`)
    } else {
      console.log(`   Saved: ${(result.savedBytes / 1024).toFixed(1)}KB (${result.savedPercent}%)`)
      totalSaved += result.savedBytes
      processedCount++
    }
    
    // Also create WebP version for modern browsers
    const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    if (!fs.existsSync(webpPath)) {
      const webpResult = await optimizeImage(fullPath, webpPath, 'webp')
      if (!webpResult.error) {
        console.log(`   Created WebP version: ${(webpResult.newSize / 1024).toFixed(1)}KB`)
      }
    }
  }
  
  if (processedCount > 0) {
    console.log(`✅ Directory complete: ${processedCount} images, ${(totalSaved / 1024 / 1024).toFixed(2)}MB saved`)
  }
}

async function generateImageReport() {
  console.log('\n📊 Generating image optimization report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    directories: {},
    summary: { totalFiles: 0, totalSize: 0, largeFiles: [], unoptimized: [] }
  }
  
  for (const dir of IMAGE_DIRS) {
    if (!fs.existsSync(dir)) continue
    
    const files = fs.readdirSync(dir, { recursive: true })
    let dirSize = 0
    let dirFiles = 0
    
    for (const file of files) {
      const fullPath = path.join(dir, file)
      if (fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file)) {
        const stats = fs.statSync(fullPath)
        dirSize += stats.size
        dirFiles++
        
        // Flag large files (>500KB)
        if (stats.size > 500 * 1024) {
          report.summary.largeFiles.push({
            file: fullPath,
            size: `${(stats.size / 1024).toFixed(1)}KB`
          })
        }
        
        // Check if has WebP version
        const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        if (!fs.existsSync(webpPath) && !/\.webp$/i.test(file)) {
          report.summary.unoptimized.push(fullPath)
        }
      }
    }
    
    report.directories[dir] = {
      files: dirFiles,
      size: `${(dirSize / 1024 / 1024).toFixed(2)}MB`
    }
    
    report.summary.totalFiles += dirFiles
    report.summary.totalSize += dirSize
  }
  
  // Write report
  fs.writeFileSync('./image-optimization-report.json', JSON.stringify(report, null, 2))
  
  console.log(`\n📋 Image Report Summary:`)
  console.log(`   Total images: ${report.summary.totalFiles}`)
  console.log(`   Total size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)}MB`)
  console.log(`   Large files (>500KB): ${report.summary.largeFiles.length}`)
  console.log(`   Missing WebP: ${report.summary.unoptimized.length}`)
  console.log(`   Report saved: ./image-optimization-report.json`)
}

async function main() {
  const command = process.argv[2]
  
  if (command === 'report') {
    await generateImageReport()
  } else if (command === 'optimize') {
    console.log('🚀 Starting image optimization...')
    
    for (const dir of IMAGE_DIRS) {
      await processDirectory(dir)
    }
    
    console.log('\n🎉 Image optimization completed!')
    await generateImageReport()
  } else {
    console.log('Usage:')
    console.log('  node optimize-all-images.js report   - Generate report only') 
    console.log('  node optimize-all-images.js optimize - Optimize all images')
  }
}

if (require.main === module) {
  main().catch(console.error)
} 