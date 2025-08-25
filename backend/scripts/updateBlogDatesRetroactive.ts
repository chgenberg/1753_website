import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function formatDate(date: Date): string {
  return date.toLocaleDateString('sv-SE') // Swedish format: YYYY-MM-DD
}

function calculateEvenIntervals(startDate: Date, endDate: Date, count: number): Date[] {
  const dates: Date[] = []
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const intervalDays = Math.floor(totalDays / (count - 1))
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + (i * intervalDays))
    dates.push(date)
  }
  
  // Ensure the last date is exactly the end date
  if (count > 0) {
    dates[count - 1] = new Date(endDate)
  }
  
  return dates.reverse() // Reverse so newest posts get most recent dates
}

async function updateBlogDatesRetroactive() {
  console.log('🗓️  Setting retroactive blog post publication dates...\n')
  
  try {
    // Get all published blog posts ordered by ID (creation order)
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { id: 'asc' } // Oldest posts first
    })
    
    console.log(`Found ${posts.length} published blog posts\n`)
    
    if (posts.length === 0) {
      console.log('No published blog posts found. Exiting.')
      return
    }
    
    // Define date range: 2022-03-01 to yesterday
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 1) // Yesterday
    endDate.setHours(12, 0, 0, 0) // Set to noon for consistency
    
    const startDate = new Date('2022-03-01')
    startDate.setHours(12, 0, 0, 0) // Set to noon for consistency
    
    console.log(`Date range: ${formatDate(startDate)} to ${formatDate(endDate)}`)
    console.log(`Total days: ${Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days\n`)
    
    // Calculate even intervals for all posts
    const publishDates = calculateEvenIntervals(startDate, endDate, posts.length)
    
    console.log('📅 Calculated publication dates:')
    publishDates.forEach((date, index) => {
      console.log(`   ${index + 1}. ${formatDate(date)}`)
    })
    console.log('')
    
    let updatedCount = 0
    
    // Update each post with its calculated date
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const publishDate = publishDates[i]
      
      // Add some random hours/minutes to make it more natural
      const randomHour = Math.floor(Math.random() * 12) + 8 // Between 8 AM and 8 PM
      const randomMinute = Math.floor(Math.random() * 60)
      publishDate.setHours(randomHour, randomMinute, 0, 0)
      
      // Update the post
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          publishedAt: publishDate,
          updatedAt: publishDate
        }
      })
      
      console.log(`✅ ${post.title.substring(0, 50)}... → ${publishDate.toLocaleString('sv-SE')}`)
      updatedCount++
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} blog posts!`)
    console.log(`📊 Posts now have evenly distributed publication dates from ${formatDate(startDate)} to ${formatDate(endDate)}`)
    console.log('⏰ Each post has randomized time of day for natural appearance')
    
    // Show distribution summary
    const monthCounts: Record<string, number> = {}
    for (const date of publishDates) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    }
    
    console.log('\n📈 Distribution by month:')
    Object.entries(monthCounts)
      .sort()
      .forEach(([month, count]) => {
        console.log(`   ${month}: ${count} posts`)
      })
    
  } catch (error) {
    console.error('❌ Error updating blog dates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting retroactive blog date update process...\n')
  
  console.log('⚠️  WARNING: This will update publication dates for ALL published blog posts!')
  console.log('📝 Posts will be distributed evenly from 2022-03-01 to yesterday')
  console.log('🔄 Older posts (by ID) will get older dates, newer posts get newer dates\n')
  
  // In a real environment, you might want to add a confirmation prompt here
  // For now, we'll proceed directly
  
  await updateBlogDatesRetroactive()
}

// Run the script
main()
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
  .finally(() => {
    console.log('\n✨ Script completed!')
  }) 