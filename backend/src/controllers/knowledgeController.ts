import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'

const SUPPORTED_LOCALES = ['sv', 'en', 'es', 'de', 'fr'] as const

type SupportedLocale = typeof SUPPORTED_LOCALES[number]

function getRequestedLocale(req: Request): SupportedLocale {
  const q = (req.query.locale as string | undefined)?.toLowerCase()
  if (q && (SUPPORTED_LOCALES as readonly string[]).includes(q)) return q as SupportedLocale
  const h = (req.headers['accept-language'] as string | undefined) || ''
  const candidate = h.split(',')[0]?.split('-')[0]?.toLowerCase()
  if (candidate && (SUPPORTED_LOCALES as readonly string[]).includes(candidate)) return candidate as SupportedLocale
  return 'sv'
}

function overlayIngredient(i: any, t: any | null) {
  if (!t) return i
  return {
    ...i,
    displayName: t.displayName ?? i.displayName,
    description: t.description ?? i.description,
    benefits: Array.isArray(t.benefits) && t.benefits.length ? t.benefits : i.benefits,
    suitableFor: Array.isArray(t.suitableFor) && t.suitableFor.length ? t.suitableFor : i.suitableFor,
    notSuitableFor: Array.isArray(t.notSuitableFor) && t.notSuitableFor.length ? t.notSuitableFor : i.notSuitableFor,
    concentration: t.concentration ?? i.concentration,
    pHRange: t.pHRange ?? i.pHRange,
    timeOfDay: t.timeOfDay ?? i.timeOfDay,
    frequency: t.frequency ?? i.frequency,
    worksWellWith: Array.isArray(t.worksWellWith) && t.worksWellWith.length ? t.worksWellWith : i.worksWellWith,
    avoidWith: Array.isArray(t.avoidWith) && t.avoidWith.length ? t.avoidWith : i.avoidWith,
    metaDescription: t.metaDescription ?? i.metaDescription,
    keywords: Array.isArray(t.keywords) && t.keywords.length ? t.keywords : i.keywords
  }
}

async function overlayIngredients(list: any[], locale: SupportedLocale) {
  if (locale === 'sv' || list.length === 0) return list
  const ids = list.map(i => i.id)
  const translations = await prisma.ingredientInfoTranslation.findMany({ where: { ingredientId: { in: ids }, locale } })
  const byId: Record<string, any> = {}
  for (const t of translations) byId[t.ingredientId] = t
  return list.map(i => overlayIngredient(i, byId[i.id] || null))
}

function overlayEducational(c: any, t: any | null) {
  if (!t) return c
  return {
    ...c,
    title: t.title ?? c.title,
    content: t.content ?? c.content,
    excerpt: t.excerpt ?? c.excerpt,
    metaTitle: t.metaTitle ?? c.metaTitle,
    metaDescription: t.metaDescription ?? c.metaDescription,
    keywords: Array.isArray(t.keywords) && t.keywords.length ? t.keywords : c.keywords
  }
}

async function overlayEducationalList(list: any[], locale: SupportedLocale) {
  if (locale === 'sv' || list.length === 0) return list
  const ids = list.map(c => c.id)
  const translations = await prisma.educationalContentTranslation.findMany({ where: { contentId: { in: ids }, locale } })
  const byId: Record<string, any> = {}
  for (const t of translations) byId[t.contentId] = t
  return list.map(c => overlayEducational(c, byId[c.id] || null))
}

// Get educational content based on user's skin profile
export const getPersonalizedContent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const locale = getRequestedLocale(req)

    // Get user's skin profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skinType: true, skinConcerns: true }
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'Användare hittades inte' })
    }

    const where: any = { isPublished: true }
    if (user.skinType) {
      where.OR = [
        { skinTypes: { has: user.skinType } },
        { skinTypes: { isEmpty: true } }
      ]
    }
    if (user.skinConcerns && user.skinConcerns.length > 0) {
      where.AND = user.skinConcerns.map(concern => ({ skinConcerns: { has: concern } }))
    }

    let content = await prisma.educationalContent.findMany({
      where,
      orderBy: [{ difficulty: 'asc' }, { readTime: 'asc' }],
      take: 20
    })

    content = await overlayEducationalList(content, locale)

    // Get user's learning progress
    const progress = await prisma.learningProgress.findMany({
      where: { userId },
      include: { content: { select: { title: true, category: true } } }
    })

    const completedIds = progress.filter(p => p.status === 'completed').map(p => p.contentId)
    const inProgressIds = progress.filter(p => p.status === 'in_progress').map(p => p.contentId)

    const recommendedContent = content.filter(c => !completedIds.includes(c.id) && !inProgressIds.includes(c.id))
    const continueLearning = content.filter(c => inProgressIds.includes(c.id))

    res.json({
      success: true,
      data: {
        recommended: recommendedContent,
        continueLearning,
        progress: progress.map(p => ({
          contentId: p.contentId,
          status: p.status,
          progressPercent: p.progressPercent,
          title: p.content.title,
          category: p.content.category
        }))
      }
    })
  } catch (error) {
    logger.error('Get personalized content error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Get all educational content with filters
export const getEducationalContent = async (req: Request, res: Response) => {
  try {
    const { category, skinType, skinConcerns, difficulty, search, page = 1, limit = 20 } = req.query
    const locale = getRequestedLocale(req)

    const where: any = { isPublished: true }
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (skinType) where.skinTypes = { has: skinType }
    if (skinConcerns) {
      const concerns = Array.isArray(skinConcerns) ? skinConcerns : [skinConcerns]
      where.AND = concerns.map(concern => ({ skinConcerns: { has: concern } }))
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { keywords: { has: search as string } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    let [content, total] = await Promise.all([
      prisma.educationalContent.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.educationalContent.count({ where })
    ])

    content = await overlayEducationalList(content, locale)

    res.json({ success: true, data: { content, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } } })
  } catch (error) {
    logger.error('Get educational content error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Get single educational content
export const getContentById = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params
    const userId = (req as any).userId
    const locale = getRequestedLocale(req)

    const content = await prisma.educationalContent.findUnique({ where: { id: contentId }, include: { ingredients: true } })
    if (!content || !content.isPublished) {
      return res.status(404).json({ success: false, message: 'Innehåll hittades inte' })
    }

    let progress = await prisma.learningProgress.findUnique({ where: { userId_contentId: { userId, contentId } } })
    if (!progress) {
      progress = await prisma.learningProgress.create({ data: { userId, contentId, status: 'not_started' } })
    }
    await prisma.learningProgress.update({ where: { id: progress.id }, data: { lastAccessedAt: new Date() } })

    const t = locale === 'sv' ? null : await prisma.educationalContentTranslation.findUnique({ where: { contentId_locale: { contentId: content.id, locale } } })
    const overlaid = overlayEducational(content, t)

    res.json({ success: true, data: { content: overlaid, progress } })
  } catch (error) {
    logger.error('Get content by ID error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Update learning progress
export const updateLearningProgress = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params
    const userId = (req as any).userId
    const { status, progressPercent, timeSpent, rating, feedback, bookmarked } = req.body

    const updateData: any = {}
    if (status) updateData.status = status
    if (progressPercent !== undefined) updateData.progressPercent = progressPercent
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent
    if (rating !== undefined) updateData.rating = rating
    if (feedback !== undefined) updateData.feedback = feedback
    if (bookmarked !== undefined) updateData.bookmarked = bookmarked
    if (status === 'in_progress' && !updateData.startedAt) updateData.startedAt = new Date()
    if (status === 'completed' && !updateData.completedAt) updateData.completedAt = new Date()

    const progress = await prisma.learningProgress.upsert({ where: { userId_contentId: { userId, contentId } }, update: updateData, create: { userId, contentId, ...updateData } })
    res.json({ success: true, data: progress, message: 'Progress uppdaterat!' })
  } catch (error) {
    logger.error('Update learning progress error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Get video guides
export const getVideoGuides = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { category, skinType, skinConcerns, difficulty, productIds, page = 1, limit = 20 } = req.query

    const where: any = { isPublished: true }
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (skinType) where.skinTypes = { has: skinType }
    if (skinConcerns) {
      const concerns = Array.isArray(skinConcerns) ? skinConcerns : [skinConcerns]
      where.AND = concerns.map(concern => ({ skinConcerns: { has: concern } }))
    }
    if (productIds) {
      const products = Array.isArray(productIds) ? productIds : [productIds]
      where.productIds = { hasSome: products }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [videos, total] = await Promise.all([
      prisma.videoGuide.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.videoGuide.count({ where })
    ])

    const watchHistory = await prisma.videoWatchHistory.findMany({ where: { userId, videoId: { in: videos.map(v => v.id) } } })

    const videosWithProgress = videos.map(video => {
      const history = watchHistory.find(h => h.videoId === video.id)
      return { ...video, watchProgress: history ? { watchedDuration: history.watchedDuration, completed: history.completed, bookmarked: history.bookmarked, rating: history.rating } : null }
    })

    res.json({ success: true, data: { videos: videosWithProgress, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } } })
  } catch (error) {
    logger.error('Get video guides error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Update video watch progress
export const updateVideoProgress = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params
    const userId = (req as any).userId
    const { watchedDuration, completed, rating, feedback, bookmarked } = req.body

    // Update view count
    await prisma.videoGuide.update({
      where: { id: videoId },
      data: { viewCount: { increment: 1 } }
    })

    const updateData: any = {}
    
    if (watchedDuration !== undefined) updateData.watchedDuration = watchedDuration
    if (completed !== undefined) updateData.completed = completed
    if (rating !== undefined) updateData.rating = rating
    if (feedback !== undefined) updateData.feedback = feedback
    if (bookmarked !== undefined) updateData.bookmarked = bookmarked

    const progress = await prisma.videoWatchHistory.upsert({
      where: {
        userId_videoId: { userId, videoId }
      },
      update: {
        ...updateData,
        lastWatchedAt: new Date()
      },
      create: {
        userId,
        videoId,
        ...updateData
      }
    })

    res.json({
      success: true,
      data: progress,
      message: 'Video progress uppdaterat!'
    })

  } catch (error) {
    logger.error('Update video progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
}

// Get ingredient information
export const getIngredients = async (req: Request, res: Response) => {
  try {
    const { search, category, safetyRating, pregnancySafe, page = 1, limit = 20 } = req.query
    const locale = getRequestedLocale(req)

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { displayName: { contains: search as string, mode: 'insensitive' } },
        { scientificName: { contains: search as string, mode: 'insensitive' } },
        { keywords: { has: search as string } }
      ]
    }
    if (category) where.category = category
    if (safetyRating) where.safetyRating = safetyRating
    if (pregnancySafe !== undefined) where.pregnancySafe = pregnancySafe === 'true'

    const skip = (Number(page) - 1) * Number(limit)
    const [ingredients, total] = await Promise.all([
      prisma.ingredientInfo.findMany({ where, skip, take: Number(limit), orderBy: { name: 'asc' }, include: { products: { select: { id: true, name: true, slug: true } } } }),
      prisma.ingredientInfo.count({ where })
    ])

    const overlaid = await overlayIngredients(ingredients, getRequestedLocale(req))

    res.json({ success: true, data: { ingredients: overlaid, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } } })
  } catch (error) {
    logger.error('Get ingredients error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Get single ingredient
export const getIngredientById = async (req: Request, res: Response) => {
  try {
    const { ingredientId } = req.params
    const locale = getRequestedLocale(req)

    const ingredient = await prisma.ingredientInfo.findUnique({
      where: { id: ingredientId },
      include: { products: { select: { id: true, name: true, slug: true, images: true, price: true } }, educationalContent: { where: { isPublished: true }, select: { id: true, title: true, slug: true, readTime: true } } }
    })

    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingrediens hittades inte' })
    }

    const t = locale === 'sv' ? null : await prisma.ingredientInfoTranslation.findUnique({ where: { ingredientId_locale: { ingredientId: ingredient.id, locale } } })
    const overlaid = overlayIngredient(ingredient, t)

    res.json({ success: true, data: overlaid })
  } catch (error) {
    logger.error('Get ingredient by ID error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Get ingredient by slug
export const getIngredientBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const locale = getRequestedLocale(req)

    const ingredient = await prisma.ingredientInfo.findUnique({
      where: { slug },
      include: { products: { select: { id: true, name: true, slug: true, images: true, price: true } }, educationalContent: { where: { isPublished: true }, select: { id: true, title: true, slug: true, readTime: true } } }
    })

    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingrediens hittades inte' })
    }

    const t = locale === 'sv' ? null : await prisma.ingredientInfoTranslation.findUnique({ where: { ingredientId_locale: { ingredientId: ingredient.id, locale } } })
    const overlaid = overlayIngredient(ingredient, t)

    res.json({ success: true, data: overlaid })
  } catch (error) {
    logger.error('Get ingredient by slug error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
}

// Get ingredient compatibility check
export const checkIngredientCompatibility = async (req: Request, res: Response) => {
  try {
    const { ingredientIds } = req.body

    if (!Array.isArray(ingredientIds) || ingredientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Ingredienslista krävs' })
    }

    const ingredients = await prisma.ingredientInfo.findMany({ where: { id: { in: ingredientIds } }, select: { id: true, name: true, displayName: true, worksWellWith: true, avoidWith: true } })

    const compatibilityResults = { compatible: [] as any[], incompatible: [] as any[], warnings: [] as string[] }

    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const ing1 = ingredients[i]
        const ing2 = ingredients[j]
        if (ing1.worksWellWith.includes(ing2.name) || ing2.worksWellWith.includes(ing1.name)) {
          compatibilityResults.compatible.push({ ingredient1: ing1.displayName, ingredient2: ing2.displayName, reason: 'Synergistiska ingredienser som förstärker varandra' })
        }
        if (ing1.avoidWith.includes(ing2.name) || ing2.avoidWith.includes(ing1.name)) {
          compatibilityResults.incompatible.push({ ingredient1: ing1.displayName, ingredient2: ing2.displayName, reason: 'Kan orsaka irritation eller minska effektivitet' })
        }
      }
    }

    res.json({ success: true, data: compatibilityResults })
  } catch (error) {
    logger.error('Check ingredient compatibility error:', error)
    res.status(500).json({ success: false, message: 'Ett fel uppstod' })
  }
} 