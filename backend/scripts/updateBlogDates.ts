import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to generate random date between two dates
function getRandomDate(start: Date, end: Date): Date {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const randomTime = startTime + Math.random() * (endTime - startTime)
  return new Date(randomTime)
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

async function updateBlogDates() {
  console.log('🗓️  Updating blog post publication dates...\n')
  
  try {
    // Get all published blog posts
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { id: 'asc' }
    })
    
    console.log(`Found ${posts.length} published blog posts\n`)
    
    // Define date range: 2024-02-12 to today
    const startDate = new Date('2024-02-12')
    const endDate = new Date()
    
    console.log(`Date range: ${formatDate(startDate)} to ${formatDate(endDate)}\n`)
    
    let updatedCount = 0
    
    for (const post of posts) {
      // Generate random date within range
      const randomDate = getRandomDate(startDate, endDate)
      
      // Update the post
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          publishedAt: randomDate,
          updatedAt: randomDate
        }
      })
      
      console.log(`✅ ${post.title.substring(0, 50)}... → ${formatDate(randomDate)}`)
      updatedCount++
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} blog posts!`)
    console.log('📊 Posts now have randomized publication dates from Feb 12, 2024 to today')
    
  } catch (error) {
    console.error('❌ Error updating blog dates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting blog date update process...\n')
  await updateBlogDates()
  console.log('\n✨ Blog date update completed!')
}

if (require.main === module) {
  main().catch(console.error)
}

export { updateBlogDates } 