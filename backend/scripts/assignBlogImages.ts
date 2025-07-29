import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Read the image mapping file
const mappingPath = path.join(__dirname, '../../frontend/public/images/blog/blog-images-mapping.json')
const imageMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))

// Strategy for mapping images to blog posts
// We'll distribute the 44 images across 124 blog posts
async function assignBlogImages() {
  console.log('🖼️  Assigning images to blog posts...\n')
  
  try {
    // Get all published blog posts
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { id: 'asc' }
    })
    
    console.log(`Found ${posts.length} published blog posts`)
    console.log(`Have ${imageMapping.length} images available\n`)
    
    let updatedCount = 0
    
    // Calculate distribution - cycle through images
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const imageIndex = i % imageMapping.length // Cycle through available images
      const image = imageMapping[imageIndex]
      
      // Update the blog post with image paths
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          image: `/images/blog/${image.image}`,
          thumbnail: `/images/blog/${image.thumbnail}`
        }
      })
      
      updatedCount++
      
      // Log progress every 10 posts
      if (updatedCount % 10 === 0) {
        console.log(`✅ Updated ${updatedCount} posts...`)
      }
    }
    
    console.log(`\n🎉 Successfully assigned images to ${updatedCount} blog posts!`)
    
    // Show some examples
    console.log('\n📸 Sample assignments:')
    const samples = await prisma.blogPost.findMany({
      take: 5,
      where: { image: { not: null } },
      select: { title: true, image: true, thumbnail: true }
    })
    
    samples.forEach(post => {
      console.log(`\n${post.title}`)
      console.log(`  Image: ${post.image}`)
      console.log(`  Thumb: ${post.thumbnail}`)
    })
    
  } catch (error) {
    console.error('❌ Error assigning images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Alternative strategy: Assign specific images to posts based on content/keywords
async function assignImagesByContent() {
  console.log('🎯 Assigning images based on content matching...\n')
  
  // Define keyword mappings for more intelligent assignment
  const contentMappings = [
    { keywords: ['cbd', 'cannabidiol'], preferredImages: [1, 5, 10] },
    { keywords: ['cbg', 'cannabigerol'], preferredImages: [2, 6, 11] },
    { keywords: ['hud', 'skin', 'hudvård'], preferredImages: [3, 7, 12, 15] },
    { keywords: ['endocannabinoid', 'ecs'], preferredImages: [4, 8, 13] },
    { keywords: ['vatten', 'water', 'fukt'], preferredImages: [20, 25, 30] },
    { keywords: ['inflammation', 'rosacea', 'akne'], preferredImages: [16, 21, 26] },
    { keywords: ['naturlig', 'natural', 'växt'], preferredImages: [35, 40, 42] },
    // Add more mappings as needed
  ]
  
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true }
    })
    
    let updatedCount = 0
    const usedImages = new Set<number>()
    
    for (const post of posts) {
      const contentLower = (post.title + ' ' + post.content).toLowerCase()
      let selectedImageIndex = -1
      
      // Try to find a matching image based on keywords
      for (const mapping of contentMappings) {
        if (mapping.keywords.some(keyword => contentLower.includes(keyword))) {
          // Find an unused preferred image
          for (const imgIndex of mapping.preferredImages) {
            if (!usedImages.has(imgIndex - 1) && imageMapping[imgIndex - 1]) {
              selectedImageIndex = imgIndex - 1
              usedImages.add(selectedImageIndex)
              break
            }
          }
          if (selectedImageIndex !== -1) break
        }
      }
      
      // If no match found, use next available image
      if (selectedImageIndex === -1) {
        for (let i = 0; i < imageMapping.length; i++) {
          if (!usedImages.has(i)) {
            selectedImageIndex = i
            usedImages.add(i)
            break
          }
        }
      }
      
      // If still no image (more posts than images), cycle
      if (selectedImageIndex === -1) {
        selectedImageIndex = updatedCount % imageMapping.length
      }
      
      const image = imageMapping[selectedImageIndex]
      
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          image: `/images/blog/${image.image}`,
          thumbnail: `/images/blog/${image.thumbnail}`
        }
      })
      
      updatedCount++
    }
    
    console.log(`\n✅ Successfully assigned images to ${updatedCount} blog posts using content matching!`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const strategy = process.argv[2] || 'simple'
  
  if (strategy === 'content') {
    await assignImagesByContent()
  } else {
    await assignBlogImages()
  }
}

main() 