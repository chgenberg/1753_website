import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { answers, name, email } = await request.json()

    // If no OpenAI API key, return basic analysis
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        skinType: analyzeSkinType(answers),
        recommendedProducts: getBasicRecommendations(answers),
        tips: getBasicTips(answers),
        score: calculateBasicScore(answers)
      })
    }

    // Import OpenAI dynamically
    const { default: OpenAI } = await import('openai')
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    // Generate AI-powered analysis
    const prompt = `Analysera följande hudvårdssvar och ge personliga rekommendationer:
    
Svar: ${JSON.stringify(answers)}
Namn: ${name}

Ge en JSON-respons med:
- skinType: kort beskrivning av hudtypen
- recommendedProducts: array med 3 produktnamn
- tips: array med 3 personliga tips
- score: hudpoäng 1-100

Svara endast med JSON.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content
    
    try {
      const parsed = JSON.parse(aiResponse || '{}')
      return NextResponse.json(parsed)
    } catch {
      // Fallback if AI response is not valid JSON
      return NextResponse.json({
        skinType: analyzeSkinType(answers),
        recommendedProducts: getBasicRecommendations(answers),
        tips: getBasicTips(answers),
        score: calculateBasicScore(answers)
      })
    }

  } catch (error) {
    console.error('Quiz results error:', error)
    
    // Parse request again for fallback
    const { answers } = await request.json()
    
    return NextResponse.json({
      skinType: analyzeSkinType(answers),
      recommendedProducts: getBasicRecommendations(answers),
      tips: getBasicTips(answers),
      score: calculateBasicScore(answers)
    })
  }
}

// Fallback analysis functions
function analyzeSkinType(answers: any): string {
  if (answers.skinType === 'dry') return 'Torr hud som behöver extra fukt'
  if (answers.skinType === 'oily') return 'Fet hud som behöver balansering'
  if (answers.skinType === 'sensitive') return 'Känslig hud som behöver mild vård'
  if (answers.skinType === 'combination') return 'Kombinationshud som behöver zonvård'
  return 'Normal hud som behöver grundläggande vård'
}

function getBasicRecommendations(answers: any): string[] {
  const products = []
  
  if (answers.skinType === 'dry') {
    products.push('DUO Face Oil', 'Fungtastic Face Cream', 'Au Naturel Cleanser')
  } else if (answers.skinType === 'oily') {
    products.push('THE Serum', 'I LOVE Face Mask', 'Au Naturel Cleanser')
  } else {
    products.push('DUO Face Oil', 'THE Serum', 'Au Naturel Cleanser')
  }
  
  return products
}

function getBasicTips(answers: any): string[] {
  return [
    'Använd solskydd dagligen',
    'Drick minst 2 liter vatten per dag',
    'Få 7-8 timmars sömn per natt'
  ]
}

function calculateBasicScore(answers: any): number {
  let score = 70
  
  if (answers.sleep === '7-8') score += 10
  if (answers.water === '2-3L') score += 10  
  if (answers.stress === 'low') score += 10
  
  return Math.min(score, 100)
} 