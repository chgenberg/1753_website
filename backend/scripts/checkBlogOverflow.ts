import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBlogOverflow() {
  console.log('Checking blog posts for overflow issues...')
  
  const posts = await prisma.blogPost.findMany({
    where: { published: true }
  })
  
  console.log(`Found ${posts.length} published blog posts\n`)
  
  let issuesFound = 0
  
  for (const post of posts) {
    const issues = []
    
    // Check for long URLs that could cause overflow
    const urlPattern = /https?:\/\/[^\s<>"]{50,}/g
    const longUrls = post.content.match(urlPattern)
    if (longUrls && longUrls.length > 0) {
      issues.push(`${longUrls.length} long URLs found (50+ chars)`)
    }
    
    // Check for very long words without spaces
    const longWordPattern = /\b\w{40,}\b/g
    const longWords = post.content.match(longWordPattern)
    if (longWords && longWords.length > 0) {
      issues.push(`${longWords.length} very long words found (40+ chars)`)
    }
    
    // Check for long unbroken sequences with dots or other characters
    const longSequencePattern = /[^\s<>"]{60,}/g
    const longSequences = post.content.match(longSequencePattern)
    if (longSequences && longSequences.length > 0) {
      issues.push(`${longSequences.length} long unbroken sequences found (60+ chars)`)
    }
    
    // Check for specific problematic patterns
    const problemPatterns = [
      { pattern: /cancer\.gov\S+/g, name: 'cancer.gov URLs' },
      { pattern: /vetenskaphalsa\S+/g, name: 'vetenskaphalsa URLs' },
      { pattern: /ncbi\.nlm\.nih\.gov\S+/g, name: 'NCBI URLs' },
      { pattern: /who\.int\S+/g, name: 'WHO URLs' },
      { pattern: /nature\.com\S+/g, name: 'Nature URLs' },
      { pattern: /selakartidningen\S+/g, name: 'Selakartidningen URLs' },
      { pattern: /\b[A-Za-z0-9.-]+\.[A-Za-z]{2,}\S{30,}/g, name: 'Long domain sequences' }
    ]
    
    for (const { pattern, name } of problemPatterns) {
      const matches = post.content.match(pattern)
      if (matches && matches.length > 0) {
        issues.push(`${matches.length} ${name} found`)
      }
    }
    
    if (issues.length > 0) {
      issuesFound++
      console.log(`--- Post ${issuesFound}: ${post.title} ---`)
      console.log(`Slug: ${post.slug}`)
      issues.forEach(issue => console.log(`⚠️  ${issue}`))
      
      // Show a preview of problematic content
      const preview = post.content.substring(0, 200).replace(/\n/g, ' ')
      console.log(`Content preview: ${preview}...`)
      console.log()
    }
  }
  
  if (issuesFound === 0) {
    console.log('🎉 No overflow issues found in any blog posts!')
  } else {
    console.log(`\n📊 Summary: ${issuesFound} posts have potential overflow issues`)
  }
}

async function fixBlogOverflow() {
  console.log('Fixing blog post overflow issues...')
  
  const posts = await prisma.blogPost.findMany({
    where: { published: true }
  })
  
  let postsUpdated = 0
  
  for (const post of posts) {
    const originalContent = post.content
    let cleanedContent = originalContent
    
    // Fix long URLs by wrapping them in proper HTML with word-break
    cleanedContent = cleanedContent.replace(
      /(https?:\/\/[^\s<>"]{30,})/g,
      '<span style="word-break: break-all; overflow-wrap: anywhere;">$1</span>'
    )
    
    // Fix long sequences of dots or other characters
    cleanedContent = cleanedContent.replace(
      /([^\s<>"]{50,})/g,
      '<span style="word-break: break-all; overflow-wrap: anywhere;">$1</span>'
    )
    
    // Specifically handle common problematic URL patterns
    const urlPatterns = [
      'cancer.gov',
      'vetenskaphalsa.se',
      'ncbi.nlm.nih.gov',
      'who.int',
      'nature.com',
      'selakartidningen.se',
      'pubmed.ncbi.nlm.nih.gov',
      'journals.org'
    ]
    
    for (const domain of urlPatterns) {
      const regex = new RegExp(`(${domain.replace('.', '\\.')}\\S{20,})`, 'g')
      cleanedContent = cleanedContent.replace(
        regex,
        '<span style="word-break: break-all; overflow-wrap: anywhere;">$1</span>'
      )
    }
    
    // Clean up any double-wrapped spans
    cleanedContent = cleanedContent.replace(
      /<span style="word-break: break-all; overflow-wrap: anywhere;"><span style="word-break: break-all; overflow-wrap: anywhere;">([^<]+)<\/span><\/span>/g,
      '<span style="word-break: break-all; overflow-wrap: anywhere;">$1</span>'
    )
    
    if (cleanedContent !== originalContent) {
      try {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: cleanedContent }
        })
        
        postsUpdated++
        console.log(`✅ Updated post: ${post.title}`)
        console.log(`Original length: ${originalContent.length}`)
        console.log(`Cleaned length: ${cleanedContent.length}`)
        console.log()
      } catch (error) {
        console.error(`❌ Error updating post "${post.title}":`, error)
      }
    }
  }
  
  console.log(`🎉 Blog post overflow fixing completed!`)
  console.log(`📊 ${postsUpdated} posts were updated with overflow fixes`)
}

async function main() {
  const command = process.argv[2]
  
  try {
    if (command === 'fix') {
      await fixBlogOverflow()
    } else {
      await checkBlogOverflow()
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 