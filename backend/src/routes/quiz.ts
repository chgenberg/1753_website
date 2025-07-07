import express from 'express'
import { OpenAIService, QuizAnswers } from '../services/openaiService'
import { body, validationResult } from 'express-validator'

const router = express.Router()

/**
 * POST /api/quiz/results
 * Generera personaliserade hudvårdsresultat baserat på quiz-svar
 */
router.post('/results', [
  body('skinType').notEmpty().withMessage('Hudtyp krävs'),
  body('concerns').isArray().withMessage('Hudproblem måste vara en array'),
  body('lifestyle').isArray().withMessage('Livsstil måste vara en array'),
  body('currentProducts').isArray().withMessage('Nuvarande produkter måste vara en array'),
  body('goals').isArray().withMessage('Mål måste vara en array'),
  body('age').notEmpty().withMessage('Ålder krävs'),
  body('budget').notEmpty().withMessage('Budget krävs'),
], async (req, res) => {
  try {
    // Validera input
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ogiltiga quiz-svar',
        errors: errors.array()
      })
    }

    const quizAnswers: QuizAnswers = {
      skinType: req.body.skinType,
      concerns: req.body.concerns,
      lifestyle: req.body.lifestyle,
      currentProducts: req.body.currentProducts,
      goals: req.body.goals,
      age: req.body.age,
      budget: req.body.budget
    }

    // Generera personaliserade resultat med OpenAI
    const results = await OpenAIService.generateQuizResults(quizAnswers)

    res.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Quiz results error:', error)
    res.status(500).json({
      success: false,
      message: 'Kunde inte generera personaliserade resultat',
      error: error instanceof Error ? error.message : 'Okänt fel'
    })
  }
})

/**
 * POST /api/quiz/product-description
 * Generera AI-baserad produktbeskrivning
 */
router.post('/product-description', [
  body('productName').notEmpty().withMessage('Produktnamn krävs'),
  body('ingredients').isArray().withMessage('Ingredienser måste vara en array'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ogiltiga parametrar',
        errors: errors.array()
      })
    }

    const { productName, ingredients } = req.body

    const description = await OpenAIService.generateProductDescription(productName, ingredients)

    res.json({
      success: true,
      data: {
        productName,
        description
      }
    })

  } catch (error) {
    console.error('Product description error:', error)
    res.status(500).json({
      success: false,
      message: 'Kunde inte generera produktbeskrivning',
      error: error instanceof Error ? error.message : 'Okänt fel'
    })
  }
})

export default router 