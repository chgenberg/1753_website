import { NextRequest, NextResponse } from 'next/server'

// Helper function to determine skin type based on answers
function determineSkinType(answers: Record<string, string>): string {
  const skinTypeAnswer = answers.skinType || 'normal'
  
  const skinTypes: Record<string, string> = {
    'dry': 'Torr hud som behöver grundläggande vård och skydd',
    'oily': 'Fet hud som kräver balansering',
    'combination': 'Kombinationshud - fet i T-zonen men torr på kinderna',
    'sensitive': 'Känslig hud som reagerar lätt på produkter och blir irriterad',
    'normal': 'Normal hud som behöver grundläggande vård och skydd'
  }
  
  return skinTypes[skinTypeAnswer] || skinTypes.normal
}

// Helper function to analyze concerns
function analyzeConcerns(answers: Record<string, string>): string[] {
  const concerns: string[] = []
  
  if (answers.concerns) {
    const selectedConcerns = answers.concerns.split(',')
    const concernMap: Record<string, string> = {
      'acne': 'Akne och utbrott',
      'aging': 'Åldrande och fina linjer',
      'pigmentation': 'Pigmentfläckar och ojämn hudton',
      'sensitivity': 'Rodnad och irritation',
      'dryness': 'Torrhet och flagning',
      'oiliness': 'Överproduktion av talg',
      'pores': 'Förstorade porer',
      'texture': 'Ojämn hudstruktur'
    }
    
    selectedConcerns.forEach(concern => {
      if (concernMap[concern]) {
        concerns.push(concernMap[concern])
      }
    })
  }
  
  return concerns.length > 0 ? concerns : ['Allmän hudvård och förebyggande']
}

// Helper function to calculate skin score
function calculateSkinScore(answers: Record<string, string>): number {
  let score = 70 // Base score
  
  // Positive factors
  if (answers.waterIntake === 'plenty') score += 5
  if (answers.sleepQuality === 'great') score += 5
  if (answers.stressLevel === 'low') score += 5
  if (answers.skincare === 'consistent') score += 10
  if (answers.diet === 'healthy') score += 5
  
  // Negative factors
  if (answers.concerns?.includes('acne')) score -= 10
  if (answers.concerns?.includes('sensitivity')) score -= 5
  if (answers.stressLevel === 'high') score -= 10
  if (answers.sleepQuality === 'poor') score -= 10
  
  return Math.max(0, Math.min(100, score))
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
        description: 'Börja med basrutinen morgon och kväll. Ta ett foto för att dokumentera startpunkten.',
        icon: '🌟'
      },
      { 
        week: 'Vecka 1-2', 
        milestone: 'Anpassningsfas',
        description: 'Din hud vänjer sig vid de nya produkterna. Mild rengöring och återfuktning är nyckeln.',
        icon: '🌱'
      },
      { 
        week: 'Vecka 3-4', 
        milestone: 'Första förbättringarna',
        description: concerns.includes('Rodnad och irritation') ? 'Minskad rodnad och lugnare hud' : 'Jämnare hudton och ökad lyster',
        icon: '📈'
      },
      { 
        week: '2 månader', 
        milestone: 'Synlig förändring',
        description: 'Starkare hudbarriär, minskade problem och märkbart friskare hud',
        icon: '✨'
      },
      { 
        week: '3 månader', 
        milestone: 'Optimal hudhälsa!',
        description: 'Balanserad, strålande och motståndskraftig hud. Fortsätt rutinen för bestående resultat.',
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
        link: 'https://pubmed.ncbi.nlm.nih.gov/33815513/'
      },
      {
        title: 'Omega-3 Fatty Acids and Skin Health',
        journal: 'Nutrients',
        year: '2020',
        link: 'https://pubmed.ncbi.nlm.nih.gov/32941621/'
      },
      {
        title: 'Probiotics in Dermatology',
        journal: 'Dermatology Online Journal',
        year: '2022',
        link: 'https://pubmed.ncbi.nlm.nih.gov/35595257/'
      },
      {
        title: 'Sleep and Skin Aging',
        journal: 'Clinical and Experimental Dermatology',
        year: '2021',
        link: 'https://pubmed.ncbi.nlm.nih.gov/34077569/'
      },
      {
        title: 'Stress and Skin Barrier Function',
        journal: 'International Journal of Molecular Sciences',
        year: '2023',
        link: 'https://pubmed.ncbi.nlm.nih.gov/36674987/'
      }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers, name = 'Vän', email, detailed = false } = body
    
    if (detailed) {
      // Generate comprehensive plan
      const plan = generateComprehensivePlan(answers, name)
      return NextResponse.json(plan)
    }
    
    // Simple results (backward compatibility)
    const skinType = determineSkinType(answers)
    const skinScore = calculateSkinScore(answers)
    const skinConcerns = analyzeConcerns(answers)
    
    const recommendedProducts = ['duo-kit-ta-da', 'the-one-facial-oil', 'ta-da-serum', 'fungtastic-mushroom-extract']
    
    const lifestyleTips = [
      'Drick minst 2 liter vatten per dag',
      'Sov 7-9 timmar per natt',
      'Ät omega-3 rika livsmedel',
      'Träna regelbundet för bättre cirkulation',
      'Hantera stress med meditation eller yoga'
    ]
    
    return NextResponse.json({
      skinType,
      skinScore,
      skinConcerns,
      recommendedProducts,
      lifestyleTips,
      personalizedAdvice: `Baserat på dina svar rekommenderar vi en skräddarsydd rutin för ${skinType.toLowerCase()}.`
    })
  } catch (error) {
    console.error('Error processing quiz results:', error)
    return NextResponse.json(
      { error: 'Kunde inte bearbeta dina svar' },
      { status: 500 }
    )
  }
} 