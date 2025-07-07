import fs from 'fs'
import path from 'path'

export interface BlogPostData {
  title: string
  content: string
  date?: string
  author?: string
  slug: string
  url?: string
  tags?: string[]
  category?: string
  readingTime?: number
  metaDescription?: string
  keywords?: string[]
}

export function getAllBlogPosts(): BlogPostData[] {
  const blogPostsDir = path.join(process.cwd(), '..', 'blog_posts')
  const files = fs.readdirSync(blogPostsDir)
  
  const posts = files
    .filter(file => file.endsWith('.txt'))
    .map(file => {
      const filePath = path.join(blogPostsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      
      return parseBlogPost(fileContent, file)
    })
    .filter(post => post !== null) as BlogPostData[]
  
  // Sort by date (newest first)
  return posts.sort((a, b) => {
    const dateA = a.date ? new Date(parseSwedishDate(a.date)).getTime() : 0
    const dateB = b.date ? new Date(parseSwedishDate(b.date)).getTime() : 0
    return dateB - dateA
  })
}

export function getBlogPostBySlug(slug: string): BlogPostData | null {
  const blogPostsDir = path.join(process.cwd(), '..', 'blog_posts')
  const files = fs.readdirSync(blogPostsDir)
  
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(blogPostsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const post = parseBlogPost(fileContent, file)
      
      if (post && post.slug === slug) {
        return post
      }
    }
  }
  
  return null
}

// Helper functions for content processing
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace Swedish characters
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/ü/g, 'u')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 60 characters for SEO
    .substring(0, 60)
    .replace(/-+$/, '') // Remove trailing hyphen if substring cut in middle of word
}

function generateMetaDescription(content: string, title: string): string {
  // Clean content for meta description
  const cleanContent = content
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
  
  // Try to get first meaningful paragraph (skip sources, headers, etc.)
  const sentences = cleanContent.split(/[.!?]+/)
  let description = ''
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (trimmedSentence.length > 30 && 
        !trimmedSentence.toLowerCase().includes('källor') &&
        !trimmedSentence.toLowerCase().includes('http') &&
        !trimmedSentence.match(/^\d+\./)) {
      description = trimmedSentence
      break
    }
  }
  
  // If no good sentence found, use first part of content
  if (!description && cleanContent.length > 50) {
    description = cleanContent.substring(0, 150)
  }
  
  // Fallback to title-based description
  if (!description) {
    description = `Läs mer om ${title.toLowerCase()} på 1753 Skincare. Expertkunskap inom hudvård och naturliga ingredienser.`
  }
  
  // Ensure proper length (150-160 chars is optimal for SEO)
  if (description.length > 155) {
    description = description.substring(0, 152) + '...'
  }
  
  return description
}

function extractKeywords(content: string, title: string, tags: string[]): string[] {
  const keywords = new Set<string>()
  
  // Add title words
  title.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 3) keywords.add(word)
  })
  
  // Add tags
  tags.forEach(tag => keywords.add(tag.toLowerCase()))
  
  // Add common skincare terms from content
  const skincareTerms = [
    'hudvård', 'hud', 'ansiktsbehandling', 'serum', 'kräm', 'olja',
    'cbd', 'cbg', 'cannabis', 'hampa', 'endocannabinoid',
    'akne', 'eksem', 'rosacea', 'inflammation', 'torr hud',
    'chaga', 'reishi', 'lions mane', 'cordyceps', 'svamp',
    'naturlig', 'ekologisk', 'organisk', 'vegansk',
    'antioxidant', 'antiinflammatorisk', 'fuktgivande',
    'mikrobiom', 'probiotisk', 'prebiotisk'
  ]
  
  const contentLower = content.toLowerCase()
  skincareTerms.forEach(term => {
    if (contentLower.includes(term)) {
      keywords.add(term)
    }
  })
  
  return Array.from(keywords).slice(0, 10) // Limit to 10 keywords
}

function cleanAndFormatContent(content: string): string {
  // Split content into lines for processing
  const lines = content.split('\n')
  const processedLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines initially - we'll add them back strategically
    if (!line) continue
    
    // Check if this is a heading (various patterns)
    if (isHeading(line)) {
      // Add spacing before headings (except if it's the first line)
      if (processedLines.length > 0) {
        processedLines.push('')
      }
      processedLines.push(`**${line}**`)
      processedLines.push('')
      continue
    }
    
    // Check if this is a numbered list item
    if (line.match(/^\d+\.\s/)) {
      processedLines.push(line)
      continue
    }
    
    // Check if this is a bullet point
    if (line.match(/^[-•]\s/)) {
      processedLines.push(line)
      continue
    }
    
    // Check if this is a "Så här gör du:" or similar instruction
    if (line.match(/^(Så här gör du|Tips|Notera|Viktigt|Observera|Kom ihåg):/i)) {
      if (processedLines.length > 0) {
        processedLines.push('')
      }
      processedLines.push(`**${line}**`)
      processedLines.push('')
      continue
    }
    
    // Regular paragraph
    processedLines.push(line)
    
    // Add paragraph break after regular text (but not after lists or short lines)
    if (!line.match(/^\d+\./) && !line.match(/^[-•]/) && line.length > 100) {
      processedLines.push('')
    }
  }
  
  return processedLines.join('\n').trim()
}

function isHeading(line: string): boolean {
  // Skip very long lines
  if (line.length > 150) return false
  
  // Common heading patterns
  const headingPatterns = [
    /^[A-ZÅÄÖ][a-zåäö\s]+:$/,  // "Heading:"
    /^[A-ZÅÄÖ\s]+$/,           // "ALL CAPS"
    /^[A-ZÅÄÖ][a-zåäö\s]+ – /,  // "Heading – "
    /^[A-ZÅÄÖ][a-zåäö\s]+ - /,  // "Heading - "
    /^\d+\.\s[A-ZÅÄÖ]/,        // "1. Heading"
    /^[A-ZÅÄÖ][a-zåäö\s]+ som /,  // "Something som..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ och /,  // "Something och..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ för /,  // "Something för..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ av /,   // "Something av..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ i /,    // "Something i..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ med /,  // "Something med..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ på /,   // "Something på..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ till /,  // "Something till..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ från /,  // "Something från..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ under /,  // "Something under..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ genom /,  // "Something genom..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ mellan /,  // "Something mellan..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ utan /,  // "Something utan..."
    /^[A-ZÅÄÖ][a-zåäö\s]+ inom /,  // "Something inom..."
  ]
  
  return headingPatterns.some(pattern => pattern.test(line))
}

function parseBlogPost(content: string, filename: string): BlogPostData | null {
  const lines = content.split('\n')
  
  // Extract metadata from the header
  let title = ''
  let url = ''
  let date = ''
  let author = 'Christopher Genberg'
  let contentStartIndex = 0
  
  // Parse header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('Title:')) {
      title = line.replace('Title:', '').trim()
    } else if (line.startsWith('URL:')) {
      url = line.replace('URL:', '').trim()
    } else if (line.startsWith('Scraped:')) {
      // Skip scraped date
    } else if (line.startsWith('=====')) {
      contentStartIndex = i + 1
      break
    }
  }
  
  // If no title found in header, use filename
  if (!title) {
    title = filename.replace('.txt', '').replace(/_/g, ' ')
  }
  
  // Extract date and author from content
  let mainContentStartIndex = contentStartIndex
  for (let i = contentStartIndex; i < Math.min(contentStartIndex + 10, lines.length); i++) {
    const line = lines[i].trim()
    
    // Check for date patterns (e.g., "9 januari 2023")
    if (line.match(/^\d{1,2}\s+(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)\s+\d{4}$/i)) {
      date = line
      
      // Check if next line is author
      if (i + 1 < lines.length && lines[i + 1].trim()) {
        const potentialAuthor = lines[i + 1].trim()
        if (potentialAuthor.length < 50 && !potentialAuthor.match(/^\d/)) {
          author = potentialAuthor
          mainContentStartIndex = i + 2
        }
      }
    }
  }
  
  // Generate SEO-friendly slug from title
  const slug = title
    .toLowerCase()
    .trim()
    // Replace Swedish characters
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/ü/g, 'u')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 60 characters for SEO
    .substring(0, 60)
    .replace(/-+$/, '') // Remove trailing hyphen if substring cut in middle of word
  
  // Extract main content
  let mainContent = lines
    .slice(mainContentStartIndex)
    .join('\n')
    .trim()
    // Remove duplicate title if it appears at the start of content
    .replace(new RegExp(`^${title}\\s*\\n`, 'i'), '')
    // Remove duplicate date/author info
    .replace(new RegExp(`^${date}\\s*\\n${author}\\s*\\n`, 'i'), '')
    .replace(new RegExp(`^${date}\\s*\\n`, 'i'), '')
    .trim()

  // Clean up and format the content
  mainContent = cleanAndFormatContent(mainContent)
  
  // Calculate reading time (average 200 words per minute)
  const wordCount = mainContent.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)
  
  // Extract tags based on content
  const tags = extractTags(mainContent, title)
  
  // Determine category
  const category = determineCategory(title, mainContent)
  
  // Generate meta description
  const metaDescription = generateMetaDescription(mainContent, title)
  
  // Extract keywords
  const keywords = extractKeywords(mainContent, title, tags)
  
  return {
    title,
    content: mainContent,
    date,
    author,
    slug,
    url,
    tags,
    category,
    readingTime,
    metaDescription,
    keywords
  }
}

function parseSwedishDate(dateStr: string): string {
  const months: { [key: string]: string } = {
    'januari': '01',
    'februari': '02',
    'mars': '03',
    'april': '04',
    'maj': '05',
    'juni': '06',
    'juli': '07',
    'augusti': '08',
    'september': '09',
    'oktober': '10',
    'november': '11',
    'december': '12'
  }
  
  const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/)
  if (match) {
    const day = match[1].padStart(2, '0')
    const month = months[match[2].toLowerCase()] || '01'
    const year = match[3]
    return `${year}-${month}-${day}`
  }
  
  return dateStr
}

function extractTags(content: string, title: string): string[] {
  const tags: string[] = []
  
  // Check for common topics
  if (content.toLowerCase().includes('cbd') || title.toLowerCase().includes('cbd')) {
    tags.push('CBD')
  }
  if (content.toLowerCase().includes('cbg') || title.toLowerCase().includes('cbg')) {
    tags.push('CBG')
  }
  if (content.toLowerCase().includes('endocannabinoid') || content.toLowerCase().includes('ecs')) {
    tags.push('Endocannabinoidsystem')
  }
  if (content.toLowerCase().includes('inflammation')) {
    tags.push('Inflammation')
  }
  if (content.toLowerCase().includes('akne') || content.toLowerCase().includes('acne')) {
    tags.push('Akne')
  }
  if (content.toLowerCase().includes('cannabis') || content.toLowerCase().includes('hampa')) {
    tags.push('Cannabis')
  }
  if (content.toLowerCase().includes('mikrobiom')) {
    tags.push('Mikrobiom')
  }
  if (content.toLowerCase().includes('svamp') || content.toLowerCase().includes('chaga') || 
      content.toLowerCase().includes('reishi') || content.toLowerCase().includes('lion')) {
    tags.push('Medicinska Svampar')
  }
  
  return tags
}

function determineCategory(title: string, content: string): string {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  
  if (titleLower.includes('cbd') || titleLower.includes('cbg') || 
      titleLower.includes('cannabinoid') || titleLower.includes('cannabis')) {
    return 'Cannabinoider'
  }
  if (titleLower.includes('endocannabinoid') || titleLower.includes('ecs')) {
    return 'Endocannabinoidsystem'
  }
  if (titleLower.includes('svamp') || titleLower.includes('chaga') || 
      titleLower.includes('reishi') || titleLower.includes('lion') || 
      titleLower.includes('cordyceps')) {
    return 'Medicinska Svampar'
  }
  if (titleLower.includes('hudvård') || contentLower.includes('hudvårdsrutin')) {
    return 'Hudvård'
  }
  if (titleLower.includes('inflammation') || titleLower.includes('akne') || 
      titleLower.includes('eksem') || titleLower.includes('rosacea')) {
    return 'Hudproblem'
  }
  if (titleLower.includes('mikrobiom') || titleLower.includes('bakterier')) {
    return 'Mikrobiom'
  }
  if (titleLower.includes('industri') || titleLower.includes('bransch')) {
    return 'Industrikritik'
  }
  
  return 'Hudvård'
} 