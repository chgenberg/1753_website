import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSpecificIssues() {
  try {
    console.log('🔍 Checking for specific blog post issues...\n')
    
    const posts = await prisma.blogPost.findMany({
      where: { published: true }
    })
    
    let issuesFound = 0
    
    for (const post of posts) {
      const content = post.content
      let hasIssues = false
      
      console.log(`📝 Post: ${post.title}`)
      console.log(`🔗 Slug: ${post.slug}`)
      
      // Check for target= issues
      if (content.includes('target=')) {
        console.log('  ❌ Found target= issue')
        const matches = content.match(/target=[^"\s]*/g)
        if (matches) {
          matches.forEach(match => console.log(`     ${match}`))
        }
        hasIssues = true
      }
      
      // Check for concatenated text (two words smashed together)
      const concatenatedPatterns = [
        /[a-zåäö][A-ZÅÄÖ][a-zåäö]/g, // lowercase followed by uppercase
        /\w+\s*\w+\s*är\s*idag\s*/g, // specific pattern like "Hudcancer över tidHudcancer är idag"
        /[a-zåäö]{3,}[A-ZÅÄÖ][a-zåäö]{3,}/g // longer concatenated words
      ]
      
      concatenatedPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern)
        if (matches) {
          console.log(`  ❌ Found concatenated text (pattern ${index + 1}):`)
          matches.forEach(match => console.log(`     ${match}`))
          hasIssues = true
        }
      })
      
      // Check for malformed links
      if (content.includes('href=') && !content.includes('href="')) {
        console.log('  ❌ Found malformed href attributes')
        const matches = content.match(/href=[^"\s]*/g)
        if (matches) {
          matches.forEach(match => console.log(`     ${match}`))
        }
        hasIssues = true
      }
      
      // Check for CSS classes still present
      if (content.includes('text-blue-600') || content.includes('hover:underline')) {
        console.log('  ❌ Found CSS classes')
        hasIssues = true
      }
      
      // Check for broken source sections
      if (content.includes('Källor:') && content.includes('text-blue-600')) {
        console.log('  ❌ Found broken source section')
        hasIssues = true
      }
      
      if (!hasIssues) {
        console.log('  ✅ No issues found')
      } else {
        issuesFound++
      }
      
      console.log('')
    }
    
    console.log(`\n📊 Summary: ${issuesFound} posts with issues out of ${posts.length} total posts`)
    
  } catch (error) {
    console.error('❌ Error checking blog posts:', error)
  }
}

async function fixSpecificIssues() {
  try {
    console.log('🔧 Fixing specific blog post issues...\n')
    
    const posts = await prisma.blogPost.findMany({
      where: { published: true }
    })
    
    let updatedCount = 0
    
    for (const post of posts) {
      const originalContent = post.content
      let cleanedContent = originalContent
      let wasUpdated = false
      
      // Fix 1: Remove target= attributes (malformed links)
      if (cleanedContent.includes('target=')) {
        cleanedContent = cleanedContent.replace(/target=[^\s>"]*/g, '')
        console.log(`🔧 Fixed target= issues in: ${post.title}`)
        wasUpdated = true
      }
      
      // Fix 2: Fix concatenated text patterns
      // Pattern: "över tidHudcancer" -> "över tid. Hudcancer"
      cleanedContent = cleanedContent.replace(/([a-zåäö])\s*([A-ZÅÄÖ][a-zåäö]{2,})/g, '$1. $2')
      
      // Special case for specific patterns we know about
      cleanedContent = cleanedContent.replace(/Hudcancer över tidHudcancer/g, 'Hudcancer över tid. Hudcancer')
      cleanedContent = cleanedContent.replace(/([a-zåäö]{3,})([A-ZÅÄÖ][a-zåäö]{3,})/g, '$1. $2')
      
      // Fix 3: Clean up malformed href attributes
      if (cleanedContent.includes('href=') && !cleanedContent.includes('href="')) {
        cleanedContent = cleanedContent.replace(/href=([^\s>"]*)/g, 'href="$1"')
        console.log(`🔧 Fixed href attributes in: ${post.title}`)
        wasUpdated = true
      }
      
      // Fix 4: Remove CSS classes and fix source sections
      if (cleanedContent.includes('text-blue-600') || cleanedContent.includes('hover:underline')) {
        // Clean up source sections specifically
        cleanedContent = cleanedContent.replace(/text-blue-600\s*hover:underline/g, '')
        cleanedContent = cleanedContent.replace(/text-blue-600/g, '')
        cleanedContent = cleanedContent.replace(/hover:underline/g, '')
        cleanedContent = cleanedContent.replace(/target=rel=/g, '')
        
        // Fix broken source URLs
        cleanedContent = cleanedContent.replace(/Källor:([^<]*)(https?:\/\/[^\s<]*)/g, 'Källor:\n$2')
        cleanedContent = cleanedContent.replace(/([a-z])([A-Z])(https?:\/\/)/g, '$1. $2$3')
        
        console.log(`🔧 Fixed CSS classes and sources in: ${post.title}`)
        wasUpdated = true
      }
      
      // Fix 5: Clean up spacing and formatting
      cleanedContent = cleanedContent
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .replace(/\.\s*\./g, '.') // Remove double periods
        .replace(/\s+\./g, '.') // Remove space before period
        .replace(/\.\s*([a-zåäö])/g, '. $1') // Ensure space after period before lowercase
        .trim()
      
      // Check if content was actually changed
      if (originalContent !== cleanedContent) {
        console.log(`\n📝 Updating: ${post.title}`)
        console.log(`📏 Length: ${originalContent.length} -> ${cleanedContent.length}`)
        
        // Show a sample of changes if the difference is small enough to be meaningful
        if (Math.abs(originalContent.length - cleanedContent.length) < 500) {
          console.log('🔍 Sample changes:')
          const changes = findDifferences(originalContent, cleanedContent)
          changes.slice(0, 3).forEach(change => console.log(`   ${change}`))
        }
        
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: cleanedContent }
        })
        
        updatedCount++
        console.log('✅ Updated successfully')
      }
    }
    
    console.log(`\n🎉 Blog cleaning completed! Updated ${updatedCount} posts out of ${posts.length} total.`)
    
  } catch (error) {
    console.error('❌ Error fixing blog posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function findDifferences(original: string, cleaned: string): string[] {
  const changes: string[] = []
  
  // Find some sample differences
  if (original.includes('target=') && !cleaned.includes('target=')) {
    changes.push('Removed target= attributes')
  }
  
  if (original.includes('text-blue-600') && !cleaned.includes('text-blue-600')) {
    changes.push('Removed CSS classes')
  }
  
  // Look for concatenation fixes
  const originalWords = original.match(/[a-zåäö][A-ZÅÄÖ][a-zåäö]/g) || []
  const cleanedWords = cleaned.match(/[a-zåäö][A-ZÅÄÖ][a-zåäö]/g) || []
  
  if (originalWords.length > cleanedWords.length) {
    changes.push('Fixed concatenated text')
  }
  
  return changes
}

// Check command line arguments
const action = process.argv[2]

if (action === 'fix') {
  fixSpecificIssues()
} else {
  checkSpecificIssues()
}

export { checkSpecificIssues, fixSpecificIssues } 