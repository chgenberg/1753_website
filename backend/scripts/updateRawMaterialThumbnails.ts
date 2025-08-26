import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Mapping of Swedish names to image filenames
const imageMapping = {
  'Blåbär': 'blueberry.jpg',
  'Lingon': 'lingonberry.jpg', 
  'Havtorn': 'sea-buckthorn.jpg',
  'Grönt te': 'green-tea.jpg',
  'Gurkmeja': 'turmeric.jpg',
  'Kimchi': 'kimchi.jpg',
  'Chiafrön': 'chia.jpg',
  'Kefir': 'kefir.jpg'
}

async function updateThumbnails() {
  try {
    console.log('🔄 Updating raw material thumbnails...')
    
    // Get all raw materials
    const rawMaterials = await prisma.rawMaterial.findMany()
    console.log(`📊 Found ${rawMaterials.length} raw materials`)
    
    let updatedCount = 0
    
    for (const material of rawMaterials) {
      const imageFilename = imageMapping[material.swedishName as keyof typeof imageMapping]
      
      if (imageFilename) {
        // Check if the image file actually exists
        const imagePath = path.join(__dirname, '../../frontend/public/images/raw-materials', imageFilename)
        
        if (fs.existsSync(imagePath)) {
          await prisma.rawMaterial.update({
            where: { id: material.id },
            data: { thumbnail: `/images/raw-materials/${imageFilename}` }
          })
          
          console.log(`✅ Updated ${material.swedishName} -> ${imageFilename}`)
          updatedCount++
        } else {
          console.log(`⚠️  Image not found for ${material.swedishName}: ${imageFilename}`)
        }
      } else {
        console.log(`⏭️  No image mapping for ${material.swedishName}`)
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount} raw material thumbnails`)
    
  } catch (error) {
    console.error('❌ Error updating thumbnails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateThumbnails() 