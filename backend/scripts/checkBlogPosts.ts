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
      
            // Clean the content with simple but effective patterns
      let cleanedContent = originalContent
      
      // Step 1: Replace HTML entities
      cleanedContent = cleanedContent
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      
      // Step 2: Remove all CSS class patterns (multiple passes to catch nested ones)
      for (let i = 0; i < 5; i++) {
        cleanedContent = cleanedContent
          // Remove any text that looks like CSS classes in quotes
          .replace(/"[^"]*(?:mb-|mt-|text-|leading-|font-|prose-|list-|space-|italic|bold)[^"]*"/g, '')
          // Remove any remaining quoted CSS-like patterns
          .replace(/"(?:mb-\d+|mt-\d+|text-[\w-]+|leading-[\w-]+|font-[\w-]+|italic|bold|px-\d+|py-\d+|prose-[\w-]+|list-[\w-]+|space-[\w-]+|my-\d+)"/g, '')
          // Remove class attributes
          .replace(/class="[^"]*"/g, '')
          // Remove patterns like > "something" >
          .replace(/>\s*"[^"]*"\s*>/g, '>')
          // Remove $1 artifacts from previous cleaning
          .replace(/\$1/g, '')
          // NEW: Remove CSS classes directly attached to HTML tags (the main remaining issue)
          .replace(/<(p|div|span|h[1-6]|ul|ol|li|strong|em|a)\s+[^>]*(?:mb-|mt-|text-|leading-|font-|prose-|list-|space-|italic|bold)[^>]*>/g, '<$1>')
          // Remove broken patterns like <pmb-6 </span>
          .replace(/<p[^>]*(?:mb-|mt-|text-|leading-|font-|prose-|list-|space-|italic|bold)[^>]*>/g, '<p>')
          .replace(/<span[^>]*(?:mb-|mt-|text-|leading-|font-|prose-|list-|space-|italic|bold)[^>]*>/g, '<span>')
          .replace(/<h[1-6][^>]*(?:mb-|mt-|text-|leading-|font-|prose-|list-|space-|italic|bold)[^>]*>/g, function(match) { 
            const level = match.match(/<h([1-6])/)?.[1] || '2';
            return `<h${level}>`;
          })
          // Remove any standalone CSS class strings that got left behind
          .replace(/\s+(?:mb-\d+|mt-\d+|text-[\w-]+|leading-[\w-]+|font-[\w-]+|italic|bold|px-\d+|py-\d+|prose-[\w-]+|list-[\w-]+|space-[\w-]+|my-\d+)\s*/g, ' ')
          // Clean up broken fragments
          .replace(/(?:mb-|mt-|text-|leading-|font-|prose-|list-|space-|italic|bold)[\w-]*\s*<\/span>/g, '</span>')
          .replace(/<\/span><\/span>/g, '</span>')
          // Clean up whitespace and empty attributes
          .replace(/\s+>/g, '>')
          .replace(/>\s+</g, '><')
          .replace(/>\s+/g, '>')
      }
      
      // Step 3: Final cleanup
      cleanedContent = cleanedContent
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
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