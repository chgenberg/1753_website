import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalCleanup() {
  try {
    console.log('🧹 Final blog post cleanup...\n')
    
    const posts = await prisma.blogPost.findMany({
      where: { published: true }
    })
    
    let updatedCount = 0
    
    for (const post of posts) {
      const originalContent = post.content
      let cleanedContent = originalContent
      let wasUpdated = false
      
      // Fix remaining concatenated text issues
      const beforeLength = cleanedContent.length
      
      // Pattern 1: Fix patterns like "pEn", "pDu", "nÄr" etc (HTML tag fragments)
      cleanedContent = cleanedContent.replace(/([a-z])([A-ZÅÄÖ][a-zåäö])/g, '$1. $2')
      
      // Pattern 2: Specific fixes for known issues
      cleanedContent = cleanedContent
        .replace(/Anna är idag /g, 'Anna är idag. ')
        .replace(/r vi är idag/g, 'r vi är idag.')
        .replace(/Hudcancer är idag /g, 'Hudcancer är idag. ')
        
      // Pattern 3: Fix letter combinations that look like broken links/fragments
      cleanedContent = cleanedContent
        .replace(/kMx/g, '')
        .replace(/jXc/g, '')
        .replace(/oAp/g, '')
        .replace(/yPa/g, '')
        .replace(/eCa/g, '')
        .replace(/uTu/g, '')
        
      // Pattern 4: Clean up any remaining HTML tag fragments
      cleanedContent = cleanedContent
        .replace(/\b[a-z]([A-ZÅÄÖ][a-zåäö]{2,})\b/g, ' $1') // Single lowercase letter followed by capitalized word
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .replace(/\.\s*\./g, '.') // Double periods
        .replace(/^\s*\.\s*/gm, '') // Lines starting with period
        .trim()
        
      const afterLength = cleanedContent.length
      
      if (originalContent !== cleanedContent) {
        console.log(`📝 Updating: ${post.title}`)
        console.log(`📏 Length: ${beforeLength} -> ${afterLength}`)
        
        // Show what was changed if significant
        if (Math.abs(beforeLength - afterLength) > 5) {
          console.log('🔍 Significant changes made')
        }
        
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: cleanedContent }
        })
        
        updatedCount++
        console.log('✅ Updated successfully\n')
      }
    }
    
    console.log(`🎉 Final cleanup completed! Updated ${updatedCount} posts out of ${posts.length} total.`)
    
  } catch (error) {
    console.error('❌ Error in final cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
finalCleanup() 