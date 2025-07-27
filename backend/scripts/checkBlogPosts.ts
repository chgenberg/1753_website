import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBlogPosts() {
  try {
    console.log('Checking blog posts for visible HTML classes...')
    
    const posts = await prisma.blogPost.findMany({
      where: { published: true }
    })
    
    console.log(`Found ${posts.length} published blog posts`)
    
    posts.forEach((post, index) => {
      console.log(`\n--- Post ${index + 1}: ${post.title} ---`)
      console.log(`Slug: ${post.slug}`)
      console.log(`Content preview (first 500 chars):`)
      console.log(post.content.substring(0, 500))
      
      // Check for visible HTML classes
      const hasVisibleClasses = post.content.includes('mb-') || 
                                post.content.includes('mt-') || 
                                post.content.includes('text-') ||
                                post.content.includes('leading-') ||
                                post.content.includes('font-') ||
                                post.content.includes('class="')
      
      if (hasVisibleClasses) {
        console.log('⚠️  WARNING: This post contains visible HTML classes!')
      } else {
        console.log('✅ No visible HTML classes found')
      }
    })
    
  } catch (error) {
    console.error('Error checking blog posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanBlogPosts() {
  try {
    console.log('Cleaning blog post content...')
    
    const posts = await prisma.blogPost.findMany({
      where: { published: true }
    })
    
    for (const post of posts) {
      const originalContent = post.content
      
      // Clean the content
      const cleanedContent = originalContent
        // Remove any escaped quotes and HTML entities
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        // Remove visible HTML class attributes
        .replace(/"(mb-\d+|mt-\d+|text-[\w-]+|leading-[\w-]+|font-[\w-]+|italic|bold|px-\d+|py-\d+|prose-[\w-]+)"/g, '')
        .replace(/class="[^"]*"/g, '')
        // Remove any remaining quotes around plain text
        .replace(/"([^"<>]*)"(?![^<]*>)/g, '$1')
        // Clean up double spaces
        .replace(/\s+/g, ' ')
        .trim()
      
      if (originalContent !== cleanedContent) {
        console.log(`\nUpdating post: ${post.title}`)
        console.log('Original length:', originalContent.length)
        console.log('Cleaned length:', cleanedContent.length)
        
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: cleanedContent }
        })
        
        console.log('✅ Updated successfully')
      } else {
        console.log(`✅ Post "${post.title}" already clean`)
      }
    }
    
    console.log('\n🎉 Blog post cleaning completed!')
    
  } catch (error) {
    console.error('Error cleaning blog posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check command line arguments
const action = process.argv[2]

if (action === 'clean') {
  cleanBlogPosts()
} else {
  checkBlogPosts()
} 