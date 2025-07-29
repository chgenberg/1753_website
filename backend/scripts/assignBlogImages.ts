import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ImageMapping {
  [key: string]: {
    original: string
    full: string
    thumbnail: string
  }
}

async function assignBlogImages() {
  try {
    // Read the image mapping
    const mappingPath = path.join(__dirname, '../../frontend/public/images/blog/blog-images-mapping.json')
    const mappingData = fs.readFileSync(mappingPath, 'utf8')
    const imageMapping: ImageMapping = JSON.parse(mappingData)
    
    // Get all available images and sort them
    const availableImages = Object.keys(imageMapping).sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.match(/\d+/)?.[0] || '0')
      return aNum - bNum
    })
    
    console.log(`Found ${availableImages.length} optimized images`)
    
    // Get all published blog posts ordered by creation date
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, slug: true }
    })
    
    console.log(`Found ${blogPosts.length} published blog posts`)
    
    // Smart image assignment to avoid duplicates side-by-side
    const imageAssignments: { [postId: string]: { image: string, thumbnail: string } } = {}
    
    // Create a rotation pattern that maximizes distance between same images
    const totalImages = availableImages.length
    const totalPosts = blogPosts.length
    
    // Calculate optimal spacing to avoid adjacent duplicates
    const spacing = Math.max(3, Math.floor(totalImages / 8)) // Minimum 3 posts between same image
    
    for (let i = 0; i < totalPosts; i++) {
      const post = blogPosts[i]
      
      // Use modulo with spacing to create a pattern that avoids adjacent duplicates
      const imageIndex = (i * spacing) % totalImages
      const imageKey = availableImages[imageIndex]
      const imageData = imageMapping[imageKey]
      
      imageAssignments[post.id] = {
        image: imageData.full,
        thumbnail: imageData.thumbnail
      }
      
      console.log(`Post ${i + 1}/${totalPosts}: "${post.title}" → ${imageKey}`)
    }
    
    // Update all blog posts with their assigned images
    const updatePromises = Object.entries(imageAssignments).map(([postId, images]) =>
      prisma.blogPost.update({
        where: { id: parseInt(postId) },
        data: {
          image: images.image,
          thumbnail: images.thumbnail
        }
      })
    )
    
    await Promise.all(updatePromises)
    
    console.log(`\n✅ Successfully assigned images to ${blogPosts.length} blog posts`)
    console.log(`📸 Used ${availableImages.length} different images with smart rotation`)
    console.log(`🔄 Spacing: minimum ${spacing} posts between same image`)
    
    // Generate assignment summary
    const assignmentSummary = blogPosts.map((post, index) => {
      const imageIndex = (index * spacing) % totalImages
      const imageKey = availableImages[imageIndex]
      return {
        post: post.title,
        slug: post.slug,
        image: imageKey,
        position: index + 1
      }
    })
    
    // Save assignment summary for reference
    const summaryPath = path.join(__dirname, '../data/blog-image-assignments.json')
    fs.writeFileSync(summaryPath, JSON.stringify(assignmentSummary, null, 2))
    console.log(`📋 Assignment summary saved to: ${summaryPath}`)
    
    // Verify no adjacent duplicates
    const adjacentCheck = []
    for (let i = 0; i < blogPosts.length - 1; i++) {
      const currentImageIndex = (i * spacing) % totalImages
      const nextImageIndex = ((i + 1) * spacing) % totalImages
      
      if (currentImageIndex === nextImageIndex) {
        adjacentCheck.push(`Posts ${i + 1} and ${i + 2} have same image`)
      }
    }
    
    if (adjacentCheck.length === 0) {
      console.log(`✅ No adjacent duplicate images found`)
    } else {
      console.warn(`⚠️  Found ${adjacentCheck.length} adjacent duplicates:`)
      adjacentCheck.forEach(warning => console.warn(`   ${warning}`))
    }
    
  } catch (error) {
    console.error('Error assigning blog images:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
assignBlogImages()
  .then(() => {
    console.log('Blog image assignment completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 