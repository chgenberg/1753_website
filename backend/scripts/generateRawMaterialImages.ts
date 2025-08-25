import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RawMaterial {
  id: string
  name: string
  swedishName: string
  category: string
  slug: string
  description: string
}

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../../frontend/public/images/raw-materials')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// Download image from URL
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}) // Delete the file async
      reject(err)
    })
  })
}

// Generate optimized prompt for each category
function generatePrompt(material: RawMaterial): string {
  const baseStyle = "Professional food photography, clean white background, natural lighting, high resolution, commercial quality"
  
  const categoryPrompts = {
    berry: `Fresh ${material.name.toLowerCase()} berries, vibrant colors, scattered naturally, some whole and some cut in half showing interior, ${baseStyle}`,
    herb: `Fresh ${material.name.toLowerCase()} herbs, green leaves, natural arrangement, botanical style, ${baseStyle}`,
    vegetable: `Fresh ${material.name.toLowerCase()}, vibrant colors, natural arrangement, ${baseStyle}`,
    fermented: `${material.name.toLowerCase()} in a glass bowl, creamy texture, natural presentation, ${baseStyle}`,
    spice: `${material.name.toLowerCase()} spice, powder and whole form, warm colors, elegant presentation, ${baseStyle}`,
    seed: `${material.name.toLowerCase()} seeds, natural texture, scattered arrangement, macro photography, ${baseStyle}`,
    tea: `${material.name.toLowerCase()} tea leaves, dried herbs, natural green colors, elegant arrangement, ${baseStyle}`,
    other: `${material.name.toLowerCase()}, natural presentation, clean aesthetic, ${baseStyle}`
  }

  return categoryPrompts[material.category as keyof typeof categoryPrompts] || categoryPrompts.other
}

// Generate image for a single raw material
async function generateImageForMaterial(material: RawMaterial): Promise<boolean> {
  try {
    const imagePath = path.join(imagesDir, `${material.slug}.jpg`)
    
    // Skip if image already exists
    if (fs.existsSync(imagePath)) {
      console.log(`⏭️  Skipping ${material.swedishName} - image already exists`)
      return true
    }

    console.log(`🎨 Generating image for ${material.swedishName}...`)
    
    const prompt = generatePrompt(material)
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard", // Use "hd" for higher quality but double cost
      style: "natural" // More photographic, less artistic
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    // Download and save the image
    await downloadImage(imageUrl, imagePath)
    
    // Update database with image path
    await prisma.rawMaterial.update({
      where: { id: material.id },
      data: { thumbnail: `/images/raw-materials/${material.slug}.jpg` }
    })

    console.log(`✅ Generated and saved image for ${material.swedishName}`)
    return true

  } catch (error) {
    console.error(`❌ Failed to generate image for ${material.swedishName}:`, error)
    return false
  }
}

// Main function to generate all images
async function generateAllImages() {
  try {
    console.log('🚀 Starting AI image generation for raw materials...')
    console.log('💰 Estimated cost: ~$0.04 per image (DALL-E 3 standard quality)')
    
    // Fetch all raw materials from database
    const rawMaterials = await prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { swedishName: 'asc' }
    })

    console.log(`📊 Found ${rawMaterials.length} raw materials to process`)
    console.log(`💵 Total estimated cost: $${(rawMaterials.length * 0.04).toFixed(2)}`)
    
    // Ask for confirmation
    console.log('\n⚠️  This will make API calls to OpenAI DALL-E 3')
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    let successCount = 0
    let failCount = 0

    // Process each material with delay to avoid rate limits
    for (let i = 0; i < rawMaterials.length; i++) {
      const material = rawMaterials[i]
      console.log(`\n[${i + 1}/${rawMaterials.length}] Processing ${material.swedishName}...`)
      
      const success = await generateImageForMaterial(material)
      if (success) {
        successCount++
      } else {
        failCount++
      }

      // Add delay between requests to respect rate limits
      if (i < rawMaterials.length - 1) {
        console.log('⏳ Waiting 2 seconds before next request...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log('\n🎉 Image generation complete!')
    console.log(`✅ Successfully generated: ${successCount} images`)
    console.log(`❌ Failed: ${failCount} images`)
    console.log(`💰 Actual cost: ~$${(successCount * 0.04).toFixed(2)}`)
    console.log(`📁 Images saved to: ${imagesDir}`)

  } catch (error) {
    console.error('💥 Script failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Utility function to generate single image (for testing)
async function generateSingleImage(slug: string) {
  try {
    const material = await prisma.rawMaterial.findUnique({
      where: { slug }
    })

    if (!material) {
      console.error(`❌ Raw material with slug "${slug}" not found`)
      return
    }

    console.log(`🎨 Generating single image for ${material.swedishName}...`)
    const success = await generateImageForMaterial(material)
    
    if (success) {
      console.log(`✅ Successfully generated image for ${material.swedishName}`)
    } else {
      console.log(`❌ Failed to generate image for ${material.swedishName}`)
    }

  } catch (error) {
    console.error('💥 Single image generation failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if script is run directly
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length > 0 && args[0] === '--single') {
    const slug = args[1]
    if (!slug) {
      console.error('❌ Please provide a slug: npm run generate-images -- --single blueberry')
      process.exit(1)
    }
    generateSingleImage(slug)
  } else {
    generateAllImages()
  }
}

export { generateAllImages, generateSingleImage } 