import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'

// Get user's progress overview
export const getProgressOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    // Get skin journey entries for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const entries = await prisma.skinJourneyEntry.findMany({
      where: {
        userId,
        createdAt: { gte: sixMonthsAgo }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Get latest progress report
    const latestReport = await prisma.progressReport.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate current statistics
    const totalEntries = entries.length
    const latestEntry = entries[entries.length - 1]
    const firstEntry = entries[0]

    const averageSkinCondition = totalEntries > 0
      ? entries.reduce((sum, entry) => sum + entry.skinCondition, 0) / totalEntries
      : 0

    const improvement = firstEntry && latestEntry
      ? latestEntry.skinCondition - firstEntry.skinCondition
      : 0

    // Calculate weekly progress
    const weeklyData = entries.reduce((acc, entry) => {
      const week = getWeekKey(entry.createdAt)
      if (!acc[week]) {
        acc[week] = { entries: [], skinSum: 0, moodSum: 0, count: 0 }
      }
      acc[week].entries.push(entry)
      acc[week].skinSum += entry.skinCondition
      acc[week].moodSum += entry.mood || 0
      acc[week].count++
      return acc
    }, {} as Record<string, any>)

    const progressData = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      averageSkinCondition: data.skinSum / data.count,
      averageMood: data.moodSum / data.count,
      entryCount: data.count
    }))

    // Get active suggestions
    const suggestions = await prisma.personalizedSuggestion.findMany({
      where: {
        userId,
        isHidden: false,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } }
        ]
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalEntries,
          averageSkinCondition: Math.round(averageSkinCondition * 10) / 10,
          improvement: Math.round(improvement * 10) / 10,
          currentCondition: latestEntry?.skinCondition || 0,
          daysTracking: totalEntries > 0 && firstEntry
            ? Math.ceil((new Date().getTime() - firstEntry.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0
        },
        progressData,
        latestReport,
        suggestions,
        recentEntries: entries.slice(-10)
      }
    })

  } catch (error) {
    logger.error('Get progress overview error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
}

// Generate monthly progress report using AI
export const generateProgressReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { month } = req.params // Format: YYYY-MM

    // Check if report already exists
    const existingReport = await prisma.progressReport.findUnique({
      where: {
        userId_month: { userId, month }
      }
    })

    if (existingReport) {
      return res.json({
        success: true,
        data: existingReport,
        message: 'Rapport redan genererad'
      })
    }

    // Get entries for the month
    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const entries = await prisma.skinJourneyEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    if (entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Inga hudreseinlägg för denna månad'
      })
    }

    // Calculate statistics
    const averageSkinCondition = entries.reduce((sum, entry) => sum + entry.skinCondition, 0) / entries.length
    const averageMood = entries.filter(e => e.mood).reduce((sum, entry) => sum + (entry.mood || 0), 0) / entries.filter(e => e.mood).length || 0
    
    const firstEntry = entries[0]
    const lastEntry = entries[entries.length - 1]
    const overallProgress = lastEntry.skinCondition - firstEntry.skinCondition

    // Get previous month for comparison
    const prevMonth = new Date(startDate)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
    
    const prevReport = await prisma.progressReport.findUnique({
      where: {
        userId_month: { userId, month: prevMonthKey }
      }
    })

    const moodTrend = prevReport ? averageMood - (prevReport.moodTrend || 0) : 0

    // Generate AI insights (simplified for now - could use OpenAI)
    const keyInsights = generateInsights(entries, overallProgress, averageMood)
    const improvements = generateImprovements(entries, prevReport)
    const concerns = generateConcerns(entries)
    const recommendations = generateRecommendations(entries)
    const achievements = generateAchievements(entries, overallProgress)
    const nextMonthGoals = generateNextMonthGoals(entries)

    const summaryText = generateSummaryText(entries, overallProgress, keyInsights)

    // Create progress report
    const report = await prisma.progressReport.create({
      data: {
        userId,
        month,
        overallProgress,
        keyInsights,
        improvements,
        concerns,
        recommendations,
        averageSkinCondition,
        moodTrend,
        consistencyScore: calculateConsistencyScore(entries),
        summaryText,
        achievements,
        nextMonthGoals
      }
    })

    logger.info(`Progress report generated for user ${userId}, month ${month}`)

    res.json({
      success: true,
      data: report,
      message: 'Månadsrapport genererad!'
    })

  } catch (error) {
    logger.error('Generate progress report error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid generering av rapport'
    })
  }
}

// Create dynamic suggestion
export const createSuggestion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const {
      type,
      title,
      description,
      reason,
      urgency = 'medium',
      category,
      triggers = [],
      seasonalFactor,
      weatherFactor,
      productIds = [],
      validUntil
    } = req.body

    const suggestion = await prisma.personalizedSuggestion.create({
      data: {
        userId,
        type,
        title,
        description,
        reason,
        urgency,
        category,
        triggers,
        seasonalFactor,
        weatherFactor,
        productIds,
        validUntil: validUntil ? new Date(validUntil) : null
      }
    })

    res.status(201).json({
      success: true,
      data: suggestion,
      message: 'Förslag skapat!'
    })

  } catch (error) {
    logger.error('Create suggestion error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
}

// Get personalized suggestions
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { type, category, unreadOnly } = req.query

    const where: any = {
      userId,
      isHidden: false,
      OR: [
        { validUntil: null },
        { validUntil: { gte: new Date() } }
      ]
    }

    if (type) where.type = type
    if (category) where.category = category
    if (unreadOnly === 'true') where.isRead = false

    const suggestions = await prisma.personalizedSuggestion.findMany({
      where,
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    res.json({
      success: true,
      data: suggestions
    })

  } catch (error) {
    logger.error('Get suggestions error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
}

// Update suggestion (mark as read, rate, etc.)
export const updateSuggestion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { suggestionId } = req.params
    const { isRead, isAccepted, isHidden, rating } = req.body

    const suggestion = await prisma.personalizedSuggestion.findFirst({
      where: { id: suggestionId, userId }
    })

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Förslag hittades inte'
      })
    }

    const updated = await prisma.personalizedSuggestion.update({
      where: { id: suggestionId },
      data: {
        isRead: isRead !== undefined ? isRead : suggestion.isRead,
        isAccepted: isAccepted !== undefined ? isAccepted : suggestion.isAccepted,
        isHidden: isHidden !== undefined ? isHidden : suggestion.isHidden,
        rating: rating !== undefined ? rating : suggestion.rating
      }
    })

    res.json({
      success: true,
      data: updated,
      message: 'Förslag uppdaterat!'
    })

  } catch (error) {
    logger.error('Update suggestion error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
}

// Helper functions
function getWeekKey(date: Date): string {
  const year = date.getFullYear()
  const week = getWeekNumber(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

function generateInsights(entries: any[], progress: number, mood: number): string[] {
  const insights = []
  
  if (progress > 2) {
    insights.push('Din hudkondition har förbättrats markant denna månad!')
  } else if (progress > 0) {
    insights.push('Du ser en positiv trend i din hudkondition')
  } else if (progress < -2) {
    insights.push('Din hudkondition har behövt extra uppmärksamhet denna månad')
  }

  if (mood > 7) {
    insights.push('Du verkar mycket nöjd med din hudvårdsrutin')
  } else if (mood < 5) {
    insights.push('Det kan vara dags att justera din hudvårdsrutin')
  }

  const consistentEntries = entries.length > 20
  if (consistentEntries) {
    insights.push('Utmärkt konsistens med dina hudreseinlägg!')
  }

  return insights
}

function generateImprovements(entries: any[], prevReport: any): string[] {
  const improvements = []
  
  // Compare with previous month
  if (prevReport) {
    const currentAvg = entries.reduce((sum, e) => sum + e.skinCondition, 0) / entries.length
    if (currentAvg > prevReport.averageSkinCondition) {
      improvements.push('Högre genomsnittlig hudkondition än förra månaden')
    }
  }

  // Check for specific improvements
  const recentEntries = entries.slice(-7) // Last week
  const earlyEntries = entries.slice(0, 7) // First week
  
  if (recentEntries.length > 0 && earlyEntries.length > 0) {
    const recentAvg = recentEntries.reduce((sum, e) => sum + e.skinCondition, 0) / recentEntries.length
    const earlyAvg = earlyEntries.reduce((sum, e) => sum + e.skinCondition, 0) / earlyEntries.length
    
    if (recentAvg > earlyAvg) {
      improvements.push('Positiv utveckling under månadens slut')
    }
  }

  return improvements
}

function generateConcerns(entries: any[]): string[] {
  const concerns = []
  
  const lowRatingEntries = entries.filter(e => e.skinCondition <= 4)
  if (lowRatingEntries.length > entries.length * 0.3) {
    concerns.push('Flera dagar med låg hudkondition')
  }

  const inconsistentMood = entries.filter(e => e.mood && e.mood <= 4)
  if (inconsistentMood.length > 0) {
    concerns.push('Missnöje med nuvarande hudvårdsrutin')
  }

  return concerns
}

function generateRecommendations(entries: any[]): string[] {
  const recommendations = []
  
  const avgCondition = entries.reduce((sum, e) => sum + e.skinCondition, 0) / entries.length
  
  if (avgCondition < 5) {
    recommendations.push('Överväg att konsultera en hudterapeut')
    recommendations.push('Fokusera på grundläggande hudvård')
  } else if (avgCondition < 7) {
    recommendations.push('Fortsätt med nuvarande rutin men överväg förstärkning')
  } else {
    recommendations.push('Utmärkt progress - behåll nuvarande rutin!')
  }

  return recommendations
}

function generateAchievements(entries: any[], progress: number): string[] {
  const achievements = []
  
  if (entries.length >= 20) {
    achievements.push('Konsistens-mästare: 20+ inlägg denna månad!')
  }
  
  if (progress >= 3) {
    achievements.push('Hudförbättrare: +3 eller mer i hudkondition!')
  }
  
  const perfectDays = entries.filter(e => e.skinCondition >= 9).length
  if (perfectDays >= 5) {
    achievements.push(`Strålande hud: ${perfectDays} dagar med 9+ i kondition!`)
  }

  return achievements
}

function generateNextMonthGoals(entries: any[]): string[] {
  const goals = []
  
  const avgCondition = entries.reduce((sum, e) => sum + e.skinCondition, 0) / entries.length
  
  if (avgCondition < 7) {
    goals.push('Förbättra genomsnittlig hudkondition till 7+')
  }
  
  if (entries.length < 20) {
    goals.push('Logga minst 20 hudreseinlägg')
  }
  
  goals.push('Prova en ny hudvårdsprodukt eller teknik')
  goals.push('Fokusera på konsistens i daglig rutin')

  return goals
}

function generateSummaryText(entries: any[], progress: number, insights: string[]): string {
  const avgCondition = entries.reduce((sum, e) => sum + e.skinCondition, 0) / entries.length
  
  return `Under denna månad har du loggat ${entries.length} hudreseinlägg med en genomsnittlig hudkondition på ${avgCondition.toFixed(1)}/10. ${
    progress > 0 ? `Du har förbättrat din hudkondition med ${progress.toFixed(1)} poäng!` : 
    progress < 0 ? `Din hudkondition har minskat med ${Math.abs(progress).toFixed(1)} poäng, vilket kräver uppmärksamhet.` :
    'Din hudkondition har varit stabil denna månad.'
  } ${insights.join(' ')}`
}

function calculateConsistencyScore(entries: any[]): number {
  // Simple consistency score based on number of entries
  const daysInMonth = 30
  const entryScore = Math.min(entries.length / daysInMonth, 1) * 100
  return Math.round(entryScore)
} 