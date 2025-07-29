import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFormattingIssues() {
  console.log('🔍 Checking blog posts for formatting issues...\n')
  
  const posts = await prisma.blogPost.findMany({
    where: { published: true }
  })
  
  let issuesFound = 0
  
  for (const post of posts) {
    const issues = []
    
    // Check for corrupted source formatting
    if (post.content.includes('text-blue-600 hover:underline')) {
      issues.push('Corrupted source links with CSS classes')
    }
    
    // Check for concatenated text (no space between words/sentences)
    const titleInContent = post.content.toLowerCase().includes(post.title.toLowerCase().replace(/\s+/g, ''))
    if (titleInContent) {
      issues.push('Title concatenated with content')
    }
    
    // Check for missing spaces after periods
    if (post.content.match(/[a-z]\.[A-Z]/g)) {
      issues.push('Missing spaces after periods')
    }
    
    // Check for URLs without proper formatting
    if (post.content.match(/https?:\/\/[^\s<>"]+[a-zA-Z]/g)) {
      issues.push('Unformatted URLs')
    }
    
    // Check for "Källor:" followed by malformed links
    if (post.content.includes('Källor:') && post.content.includes('target=rel=')) {
      issues.push('Malformed source section')
    }
    
    if (issues.length > 0) {
      issuesFound++
      console.log(`--- Post ${issuesFound}: ${post.title} ---`)
      console.log(`Slug: ${post.slug}`)
      issues.forEach(issue => console.log(`⚠️  ${issue}`))
      
      // Show problematic content snippets
      if (post.content.includes('text-blue-600')) {
        const snippet = post.content.match(/.{0,100}text-blue-600.{0,100}/)?.[0]
        console.log(`Source issue: ...${snippet}...`)
      }
      
      if (post.content.toLowerCase().includes(post.title.toLowerCase().replace(/\s+/g, ''))) {
        const titleNoSpaces = post.title.replace(/\s+/g, '')
        const snippet = post.content.match(new RegExp(`.{0,50}${titleNoSpaces}.{0,50}`, 'i'))?.[0]
        console.log(`Title concat: ...${snippet}...`)
      }
      
      console.log()
    }
  }
  
  if (issuesFound === 0) {
    console.log('🎉 No formatting issues found!')
  } else {
    console.log(`\n📊 Summary: ${issuesFound} posts have formatting issues`)
  }
}

async function fixFormattingIssues() {
  console.log('🔧 Fixing blog post formatting issues...\n')
  
  const posts = await prisma.blogPost.findMany({
    where: { published: true }
  })
  
  let postsUpdated = 0
  
  for (const post of posts) {
    const originalContent = post.content
    let cleanedContent = originalContent
    let hasChanges = false
    
    // Fix 1: Clean up remaining corrupted source links and CSS artifacts
    if (cleanedContent.includes('text-blue-600') || cleanedContent.includes('hover:underline')) {
      cleanedContent = cleanedContent
        .replace(/text-blue-600[^>]*>/g, '>')
        .replace(/hover:underline[^>]*>/g, '>')
        .replace(/target=<span[^>]*>[^<]*<\/span>/g, '')
        .replace(/rel=<span[^>]*>[^<]*<\/span>/g, '')
        .replace(/_blank<\/span>/g, '')
        .replace(/noopener noreferrer<\/span>/g, '')
        .replace(/target=italic/g, '')
        .replace(/rel=italic/g, '')
      hasChanges = true
    }
    
    // Fix 2: Clean up malformed span tags and CSS classes
    cleanedContent = cleanedContent
      .replace(/<span[^>]*word-break: break-all[^>]*>([^<]+)<\/span>/g, '$1')
      .replace(/<span[^>]*overflow-wrap: anywhere[^>]*>([^<]+)<\/span>/g, '$1')
      .replace(/<span[^>]*style="[^"]*"[^>]*>([^<]+)<\/span>/g, '$1')
      .replace(/<\/span><\/span>/g, '</span>')
      .replace(/<span><\/span>/g, '')
    
    if (cleanedContent !== originalContent && !hasChanges) {
      hasChanges = true
    }
    
    // Fix 3: Properly format sources section
    if (cleanedContent.includes('Källor:')) {
      cleanedContent = cleanedContent.replace(
        /Källor:[^<]*/g,
        (match) => {
          // Extract URLs from the mess
          const urls = match.match(/https?:\/\/[^\s<>"]+/g) || []
          const domains = match.match(/[a-z0-9]+\.(?:org|gov|com|se|net)[^\s<>"]*/g) || []
          
          // Create clean source list
          const allSources = [...urls, ...domains.map(d => d.startsWith('http') ? d : `https://${d}`)]
          const uniqueSources = [...new Set(allSources)]
          
          if (uniqueSources.length > 0) {
            return '\n\nKällor:\n' + uniqueSources.map(url => `• ${url}`).join('\n')
          }
          return '\n\nKällor: Se referenser i originalartikeln.'
        }
      )
      hasChanges = true
    }
    
    // Fix 4: Fix title concatenation issues
    const titleWords = post.title.split(' ')
    if (titleWords.length > 1) {
      // Look for title without spaces
      const titleNoSpaces = post.title.replace(/\s+/g, '')
      if (cleanedContent.includes(titleNoSpaces)) {
        // Replace with properly spaced title
        cleanedContent = cleanedContent.replace(
          new RegExp(titleNoSpaces, 'gi'),
          post.title
        )
        hasChanges = true
      }
      
      // Fix specific patterns like "En omfattande guide om CBG-oljaCBG-olja"
      const duplicatedLastWord = titleWords[titleWords.length - 1]
      if (duplicatedLastWord) {
        const pattern = new RegExp(`${post.title}${duplicatedLastWord}`, 'gi')
        if (cleanedContent.match(pattern)) {
          cleanedContent = cleanedContent.replace(pattern, post.title)
          hasChanges = true
        }
      }
    }
    
    // Fix 5: Clean up malformed HTML and attributes
    cleanedContent = cleanedContent
      .replace(/target=rel=/g, ' - ')
      .replace(/href="[^"]*"[^>]*>/g, '>')
      .replace(/<a[^>]*>([^<]+)<\/a>/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
    
    if (cleanedContent !== originalContent) {
      hasChanges = true
    }
    
    // Fix 6: Clean up specific problematic patterns found in the check
    const specificFixes = [
      // Remove remaining CSS class artifacts
      [/text-blue-600<\/span>/g, '</span>'],
      [/hover:underline<\/span>/g, '</span>'],
      [/target=<span[^>]*>[^<]*<\/span>/g, ''],
      [/rel=<span[^>]*>[^<]*<\/span>/g, ''],
      // Fix malformed URL structures
      [/pcom\/5-ways-to-support-the-endocannabinoid-system-with-lifestyle\/text-blue-600/g, 'https://news.pcom/5-ways-to-support-the-endocannabinoid-system-with-lifestyle/'],
      [/ncbi\.nlm\.nih\.gov\/(\d+)\/text-blue-600/g, 'https://ncbi.nlm.nih.gov/$1/'],
      // Remove orphaned HTML closing tags
      [/<\/p><</g, '<'],
      [/><\/span>/g, '>'],
    ]
    
    specificFixes.forEach(([pattern, replacement]) => {
      cleanedContent = cleanedContent.replace(pattern, replacement)
    })
    
    if (cleanedContent !== originalContent) {
      hasChanges = true
    }
    
    // Update the post if we made changes
    if (hasChanges && cleanedContent !== originalContent) {
      try {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: cleanedContent }
        })
        
        postsUpdated++
        console.log(`✅ Fixed: ${post.title}`)
        console.log(`  Original length: ${originalContent.length}`)
        console.log(`  Cleaned length: ${cleanedContent.length}`)
        
        // Show what was fixed
        if (originalContent.includes('text-blue-600') || originalContent.includes('hover:underline')) {
          console.log(`  Fixed: CSS class artifacts`)
        }
        if (originalContent.includes('Källor:') && originalContent.includes('target=rel=')) {
          console.log(`  Fixed: Source section formatting`)
        }
        if (originalContent.match(/([a-z])\.([A-Z])/)) {
          console.log(`  Fixed: Missing spaces after periods`)
        }
        if (originalContent.includes(post.title.replace(/\s+/g, ''))) {
          console.log(`  Fixed: Title concatenation`)
        }
        
        console.log()
        
      } catch (error) {
        console.error(`❌ Error updating post "${post.title}":`, error)
      }
    }
  }
  
  console.log(`🎉 Blog post formatting fix completed!`)
  console.log(`📊 ${postsUpdated} posts were updated`)
}

async function main() {
  const command = process.argv[2]
  
  try {
    if (command === 'fix') {
      await fixFormattingIssues()
    } else {
      await checkFormattingIssues()
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 