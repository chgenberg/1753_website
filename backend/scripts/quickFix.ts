import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickFix() {
  try {
    console.log('🔧 Quick fix for last 4 issues...')
    
    const posts = await prisma.blogPost.findMany({
      where: { 
        slug: { 
          in: [
            'tiden-det-tagit-for-hudvardsindustrin-att-forstora-manniskans-hud',
            'flera-olika-manniskoarter', 
            'anvand-inte-solskydd',
            'podcast-avsnitt-holy-crap'
          ]
        }
      }
    })
    
    for (const post of posts) {
      let content = post.content
      const originalContent = content
      
      // Fix the specific issues
      content = content
        .replace(/Anna är idag(?!\.)/g, 'Anna är idag.')
        .replace(/r vi är idag(?!\.)/g, 'r vi är idag.')
        .replace(/Hudcancer är idag(?!\.)/g, 'Hudcancer är idag.')
        .replace(/aWl/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (content !== originalContent) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content }
        })
        console.log(`✅ Fixed: ${post.title}`)
      } else {
        console.log(`⚠️  No changes needed for: ${post.title}`)
      }
    }
    
    console.log('🎉 Quick fix completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickFix() 