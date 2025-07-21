import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testContactAnalytics() {
  try {
    console.log('🔍 Testing Contact Form Analytics...\n')

    // Check if we have any contact submissions
    const totalSubmissions = await prisma.contactSubmission.count()
    console.log(`📊 Total contact submissions: ${totalSubmissions}`)

    if (totalSubmissions === 0) {
      console.log('📝 No submissions found. Creating some test data...\n')
      
      // Create some test submissions
      await prisma.contactSubmission.createMany({
        data: [
          {
            name: 'Anna Andersson',
            email: 'anna@email.com',
            subject: 'Fråga om ingredienser',
            message: 'Hej! Jag undrar vilka ingredienser som finns i era produkter. Speciellt intresserad av CBD-innehållet.',
            category: 'product_question',
            tags: ['product_question', 'website_contact', 'ingredients'],
            status: 'new'
          },
          {
            name: 'Erik Johansson',
            email: 'erik@company.se',
            subject: 'Återförsäljare möjligheter',
            message: 'Vi driver en hudvårdsbutik och är intresserade av att bli återförsäljare. Kan ni kontakta oss?',
            category: 'business_inquiry',
            tags: ['business_inquiry', 'website_contact', 'reseller'],
            status: 'read'
          },
          {
            name: 'Maria Svensson',
            email: 'maria@email.com',
            subject: 'Beställningsproblem',
            message: 'Min beställning #1234 har inte kommit fram än. Kan ni hjälpa mig?',
            category: 'order_issue',
            tags: ['order_issue', 'website_contact', 'shipping'],
            status: 'replied',
            respondedAt: new Date(),
            responseTime: 120 // 2 hours
          },
          {
            name: 'Sara Journalist',
            email: 'sara@tidning.se',
            subject: 'Pressförfrågan om CBD-hudvård',
            message: 'Jag skriver en artikel om CBD i hudvård. Kan jag få intervjua er?',
            category: 'press_media',
            tags: ['press_media', 'website_contact', 'interview'],
            status: 'new'
          },
          {
            name: 'Lars Larsson',
            email: 'lars@email.com',
            subject: 'Allmän fråga',
            message: 'Hej! Finns det någon fysisk butik jag kan besöka?',
            category: 'general',
            tags: ['general', 'website_contact', 'store'],
            status: 'resolved'
          }
        ]
      })
      
      console.log('✅ Created 5 test submissions')
    }

    // Get category breakdown
    const categoryStats = await prisma.contactSubmission.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    })

    console.log('\n📂 Categories:')
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat._count.category} submissions`)
    })

    // Get status breakdown
    const statusStats = await prisma.contactSubmission.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    console.log('\n📝 Status:')
    statusStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status} submissions`)
    })

    // Get recent submissions
    const recentSubmissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        category: true,
        status: true,
        createdAt: true
      }
    })

    console.log('\n📋 Recent submissions:')
    recentSubmissions.forEach(submission => {
      console.log(`   [${submission.status.toUpperCase()}] ${submission.name} - "${submission.subject}"`)
      console.log(`      Category: ${submission.category} | Email: ${submission.email}`)
      console.log(`      Created: ${submission.createdAt.toLocaleString('sv-SE')}\n`)
    })

    // Get keyword analysis
    const allSubmissions = await prisma.contactSubmission.findMany({
      select: { subject: true, message: true }
    })

    const keywordCounts: Record<string, number> = {}
    allSubmissions.forEach(submission => {
      const text = `${submission.subject} ${submission.message}`.toLowerCase()
      const words = text.match(/\b\w{4,}\b/g) || []
      words.forEach(word => {
        if (!['detta', 'vara', 'finns', 'kommer', 'skulle', 'kanske', 'email', 'från'].includes(word)) {
          keywordCounts[word] = (keywordCounts[word] || 0) + 1
        }
      })
    })

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)

    console.log('🔤 Top keywords:')
    topKeywords.forEach(([word, count]) => {
      console.log(`   "${word}": ${count} times`)
    })

    // Average response time
    const avgResponseTime = await prisma.contactSubmission.aggregate({
      where: { responseTime: { not: null } },
      _avg: { responseTime: true }
    })

    if (avgResponseTime._avg.responseTime) {
      const avgHours = Math.round(avgResponseTime._avg.responseTime / 60 * 10) / 10
      console.log(`\n⏱️  Average response time: ${avgHours} hours`)
    }

    console.log('\n✅ Contact analytics test completed!')
    console.log('\n📊 You can now access analytics via:')
    console.log('   GET /api/contact/submissions - List all submissions')
    console.log('   GET /api/contact/analytics - Get detailed analytics')
    console.log('   PATCH /api/contact/submissions/:id - Update submission status')

  } catch (error) {
    console.error('❌ Error testing contact analytics:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testContactAnalytics() 