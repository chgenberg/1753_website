import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { answers, name, email, detailed = false } = await request.json()
    
    console.log('Quiz API (/api/quiz/results) called with detailed:', detailed, 'name:', name)

    if (detailed) {
      console.log('Generating comprehensive plan...')
      // Generate comprehensive plan
      const plan = generateComprehensivePlan(answers, name)
      console.log('Plan generated, summary keys:', Object.keys(plan.summary || {}))
      return NextResponse.json(plan)
    }

    console.log('Using simple results fallback')
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

// Determine skin type from answers
function determineSkinType(answers: Record<string, string>): string {
  const skinType = answers.skinType || answers.skin_type || 'normal'
  
  switch (skinType.toLowerCase()) {
    case 'dry':
    case 'torr':
      return 'Torr hud'
    case 'oily':
    case 'fet':
      return 'Fet hud'
    case 'combination':
    case 'kombinerad':
      return 'Kombinationshud'
    case 'sensitive':
    case 'känslig':
      return 'Känslig hud'
    case 'mature':
    case 'mogen':
      return 'Mogen hud'
    default:
      return 'Normal hud'
  }
}

// Analyze concerns from answers
function analyzeConcerns(answers: Record<string, string>): string[] {
  const concerns = []
  
  if (answers.acne === 'often' || answers.skinIssues?.includes('acne')) {
    concerns.push('Akne och utbrott')
  }
  if (answers.dryness === 'often' || answers.skinIssues?.includes('dryness')) {
    concerns.push('Torrhet och flagning')
  }
  if (answers.aging === 'concerned' || answers.skinIssues?.includes('aging')) {
    concerns.push('Åldrande och fina linjer')
  }
  if (answers.sensitivity === 'high' || answers.skinIssues?.includes('sensitivity')) {
    concerns.push('Känslighet och rodnad')
  }
  if (answers.pigmentation === 'yes' || answers.skinIssues?.includes('pigmentation')) {
    concerns.push('Pigmentförändringar')
  }
  
  // Default concerns if none specified
  if (concerns.length === 0) {
    concerns.push('Allmän hudvård', 'Förebyggande åldring', 'Hudbalans')
  }
  
  return concerns
}

// Calculate skin score
function calculateSkinScore(answers: Record<string, string>): number {
  let score = 70 // Base score
  
  // Adjust based on various factors
  if (answers.sleepQuality === 'poor') score -= 10
  if (answers.stressLevel === 'high') score -= 15
  if (answers.exerciseFrequency === 'never') score -= 5
  if (answers.waterIntake === 'low') score -= 10
  if (answers.diet === 'poor') score -= 10
  if (answers.currentRoutine === 'inconsistent') score -= 5
  
  // Positive factors
  if (answers.sleepQuality === 'excellent') score += 10
  if (answers.stressLevel === 'low') score += 10
  if (answers.exerciseFrequency === 'daily') score += 5
  if (answers.waterIntake === 'high') score += 5
  if (answers.diet === 'excellent') score += 10
  
  return Math.max(30, Math.min(100, score))
}

// Generate comprehensive plan
function generateComprehensivePlan(answers: Record<string, string>, name: string) {
  const skinType = determineSkinType(answers)
  const concerns = analyzeConcerns(answers)
  const skinScore = calculateSkinScore(answers)
  
  // Lifestyle recommendations based on answers
  const sleepRec = answers.sleepQuality === 'poor' 
    ? 'Prioritera 7-9 timmars sömn för optimal hudåterhämtning'
    : '7-9 timmar kvalitetssömn'
    
  const stressRec = answers.stressLevel === 'high'
    ? 'Akut behov av stresshantering för hudhälsan'
    : 'Daglig stresshantering'
    
  // Nutrition based on skin type and concerns
  const nutritionFocus: Array<{category: string, foods: string[], benefit: string}> = []
  if (concerns.includes('Akne och utbrott')) {
    nutritionFocus.push({
      category: 'Anti-inflammatoriska livsmedel',
      foods: ['Lax', 'Valnötter', 'Blåbär', 'Gurkmeja'],
      benefit: 'Minskar inflammation som kan orsaka akne'
    })
  }
  if (concerns.includes('Åldrande och fina linjer')) {
    nutritionFocus.push({
      category: 'Kollagenbyggande',
      foods: ['Benbuljong', 'Citrusfrukter', 'Paprika', 'Avokado'],
      benefit: 'Stödjer hudens elasticitet och fasthet'
    })
  }
  if (concerns.includes('Torrhet och flagning')) {
    nutritionFocus.push({
      category: 'Återfuktande fetter',
      foods: ['Avokado', 'Olivolja', 'Nötter', 'Fet fisk'],
      benefit: 'Stärker hudbarriären och håller fukten'
    })
  }
  
  // Add base nutrition for all
  nutritionFocus.push(
    {
      category: 'Omega-3 rika livsmedel',
      foods: ['Vildfångad lax', 'Sardiner', 'Valnötter', 'Chiafrön'],
      benefit: 'Minskar inflammation och stärker hudbarriären'
    },
    {
      category: 'Antioxidanter',
      foods: ['Blåbär', 'Goji-bär', 'Mörk choklad (85%+)', 'Grönt te'],
      benefit: 'Skyddar mot fria radikaler och för tidigt åldrande'
    },
    {
      category: 'Probiotika',
      foods: ['Kimchi', 'Sauerkraut', 'Kefir', 'Kombucha'],
      benefit: 'Balanserar tarmfloran som påverkar hudhälsan'
    }
  )
  
  return {
    summary: {
      greeting: `Hej ${name}!`,
      overview: `Baserat på din hudanalys har jag identifierat att du har ${skinType.toLowerCase()}. Din hudpoäng är ${skinScore}/100, vilket visar att det finns utrymme för förbättring. Genom att följa denna skräddarsydda plan kan du uppnå betydligt bättre hudhälsa inom 3 månader.`,
      skinScore,
      mainConcerns: concerns,
      keyRecommendations: [
        concerns.includes('Akne och utbrott') ? 'Fokusera på anti-inflammatorisk kost och mild rengöring' : 'Fokusera på återfuktning och barriärstärkande',
        'Använd de rekommenderade 1753-produkterna konsekvent',
        'Implementera livsstilsförändringarna gradvis',
        'Följ kostplanen för optimal hudhälsa inifrån'
      ]
    },
    timeline: [
      { 
        week: 'Idag', 
        milestone: 'Start av din hudresa',
        description: 'Börja med basrutinen och dokumentera din hud med foton',
        icon: '🌟'
      },
      { 
        week: 'Vecka 1-2', 
        milestone: 'Anpassningsfas',
        description: 'Din hud vänjer sig vid de nya produkterna. Någon initial reaktion är normal.',
        icon: '🌱'
      },
      { 
        week: 'Vecka 3-4', 
        milestone: 'Första förbättringarna',
        description: 'Minskad inflammation, jämnare hudton och förbättrad återfuktning',
        icon: '📈'
      },
      { 
        week: '6-8 veckor', 
        milestone: 'Synlig förändring',
        description: 'Starkare hudbarriär, ökad lyster och minskat behov av andra produkter',
        icon: '✨'
      },
      { 
        week: '3 månader', 
        milestone: 'Optimal hudhälsa!',
        description: 'Balanserad, strålande och naturligt frisk hud som fungerar optimalt',
        icon: '🎯'
      }
    ],
    lifestyle: {
      sleep: {
        recommendation: sleepRec,
        tips: [
          'Sov på silkesörngott för mindre friktion',
          'Håll sovrummet svalt (16-19°C)',
          'Använd TA-DA Serum innan sömn för nattlig återhämtning',
          'Undvik skärmar 1 timme före sömn'
        ]
      },
      stress: {
        recommendation: stressRec,
        tips: [
          '10 minuters meditation varje morgon',
          'Djupandningsövningar: 4-7-8 tekniken',
          'Ta Fungtastic svampextrakt för adaptogen support',
          'Daglig promenad i naturen'
        ]
      },
      exercise: {
        recommendation: '30-45 min rörelse dagligen',
        tips: [
          'Rengör alltid huden direkt efter träning',
          'Välj andningsbara träningskläder',
          'Fokusera på lågintensiv träning vid hudproblem',
          'Yoga och pilates för stressreducering'
        ]
      }
    },
    products: {
      morning: [
        {
          step: 1,
          action: 'Skölj ansiktet med ljummet vatten',
          icon: '💧'
        },
        {
          step: 2,
          action: 'Applicera 3-4 droppar The ONE Facial Oil',
          product: 'the-one-facial-oil',
          icon: '✨'
        },
        {
          step: 3,
          action: 'Följ upp med 1-2 pump TA-DA Serum',
          product: 'ta-da-serum',
          icon: '🌟'
        },
        {
          step: 4,
          action: 'Ta 2 kapslar Fungtastic Mushroom Extract med frukost',
          product: 'fungtastic-mushroom-extract',
          icon: '🍄'
        }
      ],
      evening: [
        {
          step: 1,
          action: 'Rengör huden med Au Naturel Makeup Remover',
          product: 'au-naturel-makeup-remover',
          icon: '🧼'
        },
        {
          step: 2,
          action: 'Applicera 3-4 droppar I LOVE Facial Oil',
          product: 'i-love-facial-oil',
          icon: '❤️'
        },
        {
          step: 3,
          action: 'Avsluta med 1-2 pump TA-DA Serum',
          product: 'ta-da-serum',
          icon: '🌙'
        }
      ]
    },
    nutrition: {
      principles: 'Functional Foods & Paleo-inspirerad kost för optimal hudhälsa',
      keyFoods: nutritionFocus,
      mealPlan: {
        frukost: 'Smoothie med blåbär, spenat, MCT-olja, kollagenpulver och chiafrön',
        lunch: 'Laxsallad med avokado, valnötter, kimchi och olivolja',
        mellanmål: 'Grönt te med en handfull mandlar och 2 rutor mörk choklad',
        middag: 'Gräsbeteskött med fermenterade grönsaker, sötpotatis och benbuljong',
        kväll: 'Golden milk med gurkmeja och en tesked manukahoning'
      }
    },
    sources: [
      {
        title: 'The Role of Diet in Maintaining Skin Health',
        journal: 'Journal of Clinical and Aesthetic Dermatology',
        year: '2021',
        link: '#'
      },
      {
        title: 'Cannabinoids in Dermatology',
        journal: 'Journal of the American Academy of Dermatology',
        year: '2022',
        link: '#'
      },
      {
        title: 'The Gut-Skin Axis in Health and Disease',
        journal: 'Nature Reviews Gastroenterology & Hepatology',
        year: '2023',
        link: '#'
      },
      {
        title: 'Stress and Skin Aging',
        journal: 'International Journal of Molecular Sciences',
        year: '2022',
        link: '#'
      }
    ]
  }
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