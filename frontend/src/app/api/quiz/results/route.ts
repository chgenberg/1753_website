import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { answers, name, email, detailed = false } = await request.json()
    
    console.log('Quiz API (/api/quiz/results) called with detailed:', detailed, 'name:', name)

    if (detailed) {
      console.log('Generating comprehensive plan...')
      
      // Try OpenAI first for best results
      if (process.env.OPENAI_API_KEY) {
        try {
          const { default: OpenAI } = await import('openai')
          const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
          })

          const enhancedPrompt = generateEnhancedPrompt(answers, name)
          
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: enhancedPrompt }],
            temperature: 0.8,
            max_tokens: 3000, // Increased from 500 to 3000 for more comprehensive responses
          })

          const aiResponse = completion.choices[0]?.message?.content
          
          try {
            const parsed = JSON.parse(aiResponse || '{}')
            console.log('AI plan generated successfully')
            return NextResponse.json(parsed)
          } catch {
            console.log('AI response was not valid JSON, using fallback')
          }
        } catch (error) {
          console.error('OpenAI error:', error)
        }
      }
      
      // Generate comprehensive fallback plan
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
      max_tokens: 1000, // Increased from 500
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

// Enhanced prompt for AI to generate comprehensive results
function generateEnhancedPrompt(answers: Record<string, string>, name: string): string {
  return `Du är en expert på hudvård och cannabinoid-baserade hudprodukter. Analysera följande svar från en hudvårdsquiz och skapa en MYCKET detaljerad och värdefull personlig plan.

Kundens namn: ${name}
Quiz-svar: ${JSON.stringify(answers, null, 2)}

Skapa en omfattande JSON-respons med följande struktur. Var MYCKET detaljerad och ge konkreta, värdefulla råd:

{
  "summary": {
    "greeting": "Personlig hälsning med namnet",
    "overview": "Detaljerad översikt av hudtillståndet (minst 3-4 meningar)",
    "skinScore": [nummer 1-100],
    "scoreExplanation": "Förklaring av poängen och vad som påverkar den positivt/negativt",
    "mainConcerns": ["Lista med 3-5 huvudbekymmer"],
    "keyRecommendations": ["3-5 nyckelpunkter för förbättring"],
    "uniqueInsight": "En unik insikt baserad på kombinationen av svar"
  },
  "timeline": {
    "week1": {
      "focus": "Huvudfokus vecka 1",
      "morningRoutine": ["Detaljerade steg 1", "Steg 2", "Steg 3"],
      "eveningRoutine": ["Detaljerade steg 1", "Steg 2", "Steg 3"],
      "expectedChanges": "Vad kunden kan förvänta sig",
      "tips": ["2-3 praktiska tips"]
    },
    "month1": {
      "focus": "Huvudfokus första månaden",
      "routineAdjustments": ["Justeringar att göra"],
      "expectedImprovements": ["Förväntade förbättringar"],
      "milestones": ["Milstolpar att fira"]
    },
    "month3": {
      "focus": "Långsiktigt fokus",
      "advancedTechniques": ["Avancerade tekniker"],
      "expectedResults": ["Förväntade resultat"],
      "maintenancePlan": "Hur man bibehåller resultaten"
    }
  },
  "lifestyle": {
    "sleep": {
      "recommendation": "Specifik sömnrekommendation",
      "importance": "Varför det är viktigt för just denna hudtyp",
      "tips": ["3 konkreta tips för bättre sömn"]
    },
    "stress": {
      "currentImpact": "Hur stress påverkar just denna hud",
      "techniques": ["3-4 stresshanterings-tekniker"],
      "dailyPractice": "En daglig 5-minuters rutin"
    },
    "exercise": {
      "recommendation": "Träningsrekommendation",
      "skinBenefits": "Specifika fördelar för huden",
      "bestTypes": ["Bästa träningsformerna för hudtypen"]
    },
    "environment": {
      "protection": "Miljöskydd baserat på livsstil",
      "seasonalAdjustments": "Säsongsanpassningar",
      "homeEnvironment": ["Tips för hemmiljön"]
    }
  },
  "products": {
    "essentials": [
      {
        "name": "Produktnamn från 1753",
        "why": "Detaljerad förklaring varför just denna produkt",
        "usage": "Exakt hur och när den ska användas",
        "keyIngredients": ["CBD/CBG", "Andra viktiga ingredienser"],
        "expectedResults": "Vad kunden kan förvänta sig"
      }
    ],
    "advanced": [
      {
        "name": "Tilläggsprodukt",
        "when": "När denna ska introduceras",
        "benefits": "Specifika fördelar",
        "combination": "Hur den fungerar med andra produkter"
      }
    ],
    "applicationOrder": ["Steg 1: Produkt X", "Steg 2: Produkt Y", "etc"],
    "proTips": ["3-4 professionella tips för maximal effekt"]
  },
  "nutrition": {
    "gutSkinAxis": "Förklaring av gut-skin connection för denna hudtyp",
    "keyFoods": [
      {
        "category": "Kategorinamn",
        "foods": ["Mat 1", "Mat 2", "Mat 3", "Mat 4"],
        "benefit": "Specifik nytta för denna hudtyp",
        "servingSuggestion": "Hur ofta och hur mycket"
      }
    ],
    "supplements": [
      {
        "name": "Tillskott",
        "dosage": "Dos",
        "benefit": "Specifik nytta",
        "timing": "När det ska tas"
      }
    ],
    "avoidFoods": ["Mat att undvika", "Varför"],
    "mealPlan": {
      "breakfast": "Exempel på perfekt frukost",
      "lunch": "Exempel på perfekt lunch",
      "dinner": "Exempel på perfekt middag",
      "snacks": ["Hälsosamma mellanmål"]
    },
    "hydration": {
      "dailyGoal": "Specifikt vattenmål",
      "tips": ["Tips för att nå målet"],
      "herbalteas": ["Örtteer som hjälper huden"]
    }
  },
  "sources": {
    "scientificBasis": "Vetenskaplig grund för rekommendationerna",
    "keyStudies": ["Relevanta studier om CBD/CBG för hud"],
    "additionalReading": ["Fördjupande läsning"],
    "expertNote": "En personlig expertkommentar"
  }
}

Var MYCKET generös med information och detaljer. Kunden ska känna att de fått en plan värd minst 500 kr. Använd all kunskap om CBD, CBG, endocannabinoidsystemet och hudhälsa.`
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
  const tips = []
  
  if (answers.skinType === 'dry') {
    tips.push(
      'Använd en mild rengöring som inte torkar ut huden',
      'Applicera ansiktsolja på fuktig hud för bättre absorption',
      'Drick minst 2 liter vatten per dag'
    )
  } else if (answers.skinType === 'oily') {
    tips.push(
      'Rengör ansiktet två gånger dagligen',
      'Använd lättare serum istället för tjocka krämer',
      'Undvik att överdriva med uttorkande produkter'
    )
  } else {
    tips.push(
      'Skapa en konsekvent hudvårdsrutin',
      'Skydda huden med SPF dagligen',
      'Lyssna på din hud och anpassa rutinen efter behov'
    )
  }
  
  return tips
}

function calculateBasicScore(answers: any): number {
  let score = 70
  
  if (answers.concerns?.includes('acne')) score -= 10
  if (answers.concerns?.includes('aging')) score -= 5
  if (answers.stressLevel === 'high') score -= 10
  if (answers.sleepQuality === 'poor') score -= 10
  if (answers.waterIntake === 'low') score -= 5
  
  return Math.max(30, Math.min(100, score))
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
  
  // Check for multi-select concerns
  if (answers.concerns) {
    const selectedConcerns = answers.concerns.split(',')
    selectedConcerns.forEach(concern => {
      switch(concern.trim()) {
        case 'acne':
          concerns.push('Akne och utbrott')
          break
        case 'aging':
          concerns.push('Åldrande och fina linjer')
          break
        case 'pigmentation':
          concerns.push('Pigmentförändringar')
          break
        case 'redness':
          concerns.push('Rodnad och irritation')
          break
        case 'dryness':
          concerns.push('Torrhet och flagning')
          break
      }
    })
  }
  
  // Default concerns if none specified
  if (concerns.length === 0) {
    concerns.push('Allmän hudvård', 'Förebyggande åldring', 'Hudbalans')
  }
  
  return concerns
}

// Calculate skin score with detailed explanation
function calculateSkinScore(answers: Record<string, string>): { score: number; explanation: string } {
  let score = 70 // Base score
  const factors = []
  
  // Negative factors
  if (answers.sleepQuality === 'poor') {
    score -= 10
    factors.push('Dålig sömnkvalitet (-10p)')
  }
  if (answers.stressLevel === 'high') {
    score -= 15
    factors.push('Hög stressnivå (-15p)')
  }
  if (answers.exerciseFrequency === 'never') {
    score -= 5
    factors.push('Ingen motion (-5p)')
  }
  if (answers.waterIntake === 'low') {
    score -= 10
    factors.push('Lågt vattenintag (-10p)')
  }
  if (answers.diet === 'poor') {
    score -= 10
    factors.push('Dålig kost (-10p)')
  }
  if (answers.currentRoutine === 'minimal' || answers.currentRoutine === 'none') {
    score -= 5
    factors.push('Minimal hudvårdsrutin (-5p)')
  }
  
  // Positive factors
  if (answers.sleepQuality === 'excellent') {
    score += 10
    factors.push('Utmärkt sömn (+10p)')
  }
  if (answers.stressLevel === 'low') {
    score += 10
    factors.push('Låg stress (+10p)')
  }
  if (answers.exerciseFrequency === 'daily') {
    score += 5
    factors.push('Daglig motion (+5p)')
  }
  if (answers.waterIntake === 'high') {
    score += 5
    factors.push('Bra vattenintag (+5p)')
  }
  if (answers.diet === 'excellent') {
    score += 10
    factors.push('Utmärkt kost (+10p)')
  }
  if (answers.currentRoutine === 'comprehensive') {
    score += 5
    factors.push('Omfattande hudvård (+5p)')
  }
  
  const finalScore = Math.max(30, Math.min(100, score))
  const explanation = `Din hudpoäng baseras på: ${factors.join(', ')}. ${
    finalScore >= 80 ? 'Utmärkt grund för strålande hud!' :
    finalScore >= 60 ? 'Bra utgångsläge med rum för förbättring.' :
    'Det finns stor potential för förbättring!'
  }`
  
  return { score: finalScore, explanation }
}

// Generate comprehensive plan
function generateComprehensivePlan(answers: Record<string, string>, name: string) {
  const skinType = determineSkinType(answers)
  const concerns = analyzeConcerns(answers)
  const { score: skinScore, explanation: scoreExplanation } = calculateSkinScore(answers)
  
  // Lifestyle recommendations based on answers
  const sleepRec = answers.sleepQuality === 'poor' 
    ? 'Akut prioritering: 7-9 timmars sömn för optimal hudåterhämtning. Din dåliga sömn påverkar kollagenproduktionen negativt.'
    : 'Fortsätt med 7-9 timmar kvalitetssömn för optimal cellförnyelse'
    
  const stressRec = answers.stressLevel === 'high'
    ? 'Kritiskt: Daglig stresshantering krävs. Hög kortisol bryter ner kollagen och ökar inflammation.'
    : 'Bibehåll din goda stresshantering för fortsatt hudbalans'
    
  // Nutrition based on skin type and concerns
  const nutritionFocus: Array<{category: string, foods: string[], benefit: string, servingSuggestion: string}> = []
  
  if (concerns.includes('Akne och utbrott')) {
    nutritionFocus.push({
      category: 'Anti-inflammatoriska omega-3',
      foods: ['Vildfångad lax (2x/vecka)', 'Valnötter (handflata/dag)', 'Chiafrön (2 msk/dag)', 'Sardiner'],
      benefit: 'Minskar inflammation som triggar akne och balanserar sebumproduktion',
      servingSuggestion: 'Minst 2-3 portioner fet fisk per vecka'
    })
  }
  
  if (concerns.includes('Åldrande och fina linjer')) {
    nutritionFocus.push({
      category: 'Kollagenbyggande superfoods',
      foods: ['Benbuljong (2 dl/dag)', 'Vitamin C-rika bär', 'Paprika', 'Ekologiska ägg'],
      benefit: 'Stimulerar kroppens egen kollagenproduktion och skyddar befintligt kollagen',
      servingSuggestion: 'Daglig dos av C-vitamin + kollagenkällor'
    })
  }
  
  if (concerns.includes('Torrhet och flagning')) {
    nutritionFocus.push({
      category: 'Barriärstärkande fetter',
      foods: ['Avokado (1/2 dagligen)', 'Extra virgin olivolja', 'Macadamianötter', 'Kokosolja'],
      benefit: 'Bygger upp hudens lipidbarriär inifrån för bättre fuktbevarande',
      servingSuggestion: 'Inkludera hälsosamma fetter i varje måltid'
    })
  }
  
  // Add comprehensive base nutrition
  nutritionFocus.push(
    {
      category: 'Gut-skin axis optimering',
      foods: ['Kimchi', 'Sauerkraut', 'Kefir', 'Kombucha', 'Resistenta stärkelser'],
      benefit: 'Balanserar tarmfloran som direkt påverkar hudinflammation och klarhet',
      servingSuggestion: 'Minst 1 fermenterad föda dagligen'
    },
    {
      category: 'Kraftfulla antioxidanter',
      foods: ['Blåbär (1 dl/dag)', 'Goji-bär', 'Rå kakao', 'Grönt te (3 koppar/dag)'],
      benefit: 'Neutraliserar fria radikaler som bryter ner kollagen och elastin',
      servingSuggestion: 'Antioxidantrik föda vid varje måltid'
    },
    {
      category: 'Cellförnyande näringsämnen',
      foods: ['Spenat', 'Grönkål', 'Morötter', 'Sötpotatis', 'Pumpafrön'],
      benefit: 'Rik på vitamin A, E och zink för optimal cellförnyelse',
      servingSuggestion: '5-7 portioner grönsaker dagligen'
    }
  )
  
  // Product recommendations based on skin analysis
  const productRecommendations = []
  
  if (skinType === 'Torr hud' || concerns.includes('Torrhet och flagning')) {
    productRecommendations.push(
      {
        name: 'DUO-kit (The ONE + I LOVE Facial Oil)',
        why: 'Denna kraftfulla kombination är perfekt för torr hud. CBD och CBG arbetar synergistiskt för att återställa hudens naturliga fuktbalans och stärka barriären.',
        usage: 'Morgon: 3-4 droppar I LOVE på fuktig hud. Kväll: 4-5 droppar The ONE för djup nattreparation.',
        keyIngredients: ['CBD för inflammation', 'CBG för cellförnyelse', 'Jojobaolja för barriärstärkning'],
        expectedResults: 'Synligt mjukare hud inom 7 dagar, reducerad flagning inom 2 veckor'
      }
    )
  }
  
  if (skinType === 'Fet hud' || concerns.includes('Akne och utbrott')) {
    productRecommendations.push(
      {
        name: 'TA-DA Serum',
        why: 'Lättviktigt serum som balanserar sebumproduktionen utan att täppa till porer. CBD:n minskar inflammation från akne.',
        usage: 'Applicera 2-3 droppar på ren hud morgon och kväll före andra produkter',
        keyIngredients: ['CBD för sebumbalans', 'Lättare bäraroljor', 'Anti-inflammatoriska extrakt'],
        expectedResults: 'Mindre glansig T-zon inom 1 vecka, färre utbrott inom 3-4 veckor'
      }
    )
  }
  
  // Add cleansing and additional products
  productRecommendations.push(
    {
      name: 'Au Naturel Makeup Remover',
      why: 'Mild men effektiv rengöring som respekterar hudens naturliga pH och mikrobiom. Tar bort smuts utan att störa barriären.',
      usage: 'Massera in på torr hud i 60 sekunder, emulgera med vatten, skölj av',
      keyIngredients: ['Milda växtoljor', 'Naturliga emulgeringsmedel'],
      expectedResults: 'Ren hud utan stramhet, bevarad fuktbalans'
    }
  )
  
  return {
    summary: {
      greeting: `Hej ${name}!`,
      overview: `Baserat på din omfattande hudanalys har jag identifierat att du har ${skinType.toLowerCase()} med fokusområdena: ${concerns.join(', ')}. Din hudpoäng är ${skinScore}/100. Genom att följa denna skräddarsydda plan som kombinerar 1753:s CBD/CBG-produkter med livsstilsoptimering kan du uppnå dramatiskt förbättrad hudhälsa. Planen är baserad på senaste forskningen inom endocannabinoidsystemet och gut-skin-axeln.`,
      skinScore,
      scoreExplanation,
      mainConcerns: concerns,
      keyRecommendations: [
        concerns.includes('Akne och utbrott') ? 'Fokusera på anti-inflammatorisk kost och CBD-produkter för sebumbalans' : 'Prioritera barriärstärkande produkter och omega-3-rik kost',
        'Implementera 1753:s produkter i rätt ordning för maximal synergi',
        'Optimera sömn och stresshantering - kritiskt för hudens endocannabinoidsystem',
        'Följ den gut-skin-optimerade kostplanen för resultat inifrån',
        'Var konsekvent - endocannabinoidsystemet behöver 4-6 veckor för att balanseras'
      ],
      uniqueInsight: generateUniqueInsight(answers, skinType, concerns)
    },
    timeline: {
      week1: {
        focus: 'Återställ hudens grundbalans och introducera CBD/CBG',
        morningRoutine: [
          'Mild rengöring med Au Naturel (30-60 sek massage)',
          'Applicera serum/olja på fuktig hud för optimal absorption',
          'Vänta 2-3 min innan nästa steg',
          'SPF 30+ (även inomhus vid fönster)'
        ],
        eveningRoutine: [
          'Dubbelrengöring om du använt makeup/SPF',
          'Applicera kvällsprodukt (mer generöst än morgon)',
          'Lätt ansiktsmassage 2-3 min för att öka cirkulation',
          'Silk/satinkudde för att minimera friktion'
        ],
        expectedChanges: 'Huden kan genomgå en "purging"-fas när CBD/CBG börjar balansera. Detta är normalt och visar att produkterna arbetar.',
        tips: [
          'Dokumentera med selfies för att se progressen',
          'Drick extra vatten när du introducerar nya produkter',
          'Var tålmodig - endocannabinoidsystemet behöver tid'
        ]
      },
      month1: {
        focus: 'Optimera rutinen och adressera specifika bekymmer',
        routineAdjustments: [
          'Öka mängden produkt om huden absorberar snabbt',
          'Introducera veckovis exfoliering (mild enzympeeling)',
          'Lägg till targeted treatments för problemområden'
        ],
        expectedImprovements: [
          'Jämnare hudton och textur',
          'Minskad inflammation och rodnad',
          'Förbättrad fuktbalans',
          'Färre breakouts (om aknebenägen)'
        ],
        milestones: [
          'Huden känns lugnare på morgonen',
          'Mindre behov av concealer',
          'Vänner kommenterar din "glow"'
        ]
      },
      month3: {
        focus: 'Långsiktig optimering och förebyggande',
        advancedTechniques: [
          'Gua sha eller ansiktsroller för lymfdränage',
          'Veckovis CBD-ansiktsmask för djupverkande effekt',
          'Säsongsanpassning av rutinen',
          'Introducera retinol-alternativ om anti-aging är fokus'
        ],
        expectedResults: [
          'Synligt föryngrad hud',
          'Stabil hudbalans oavsett yttre stressorer',
          'Minimala breakouts',
          'Naturlig lyster utan highlighter'
        ],
        maintenancePlan: 'Fortsätt med etablerad rutin, justera produktmängder efter säsong. Överväg Fungtastic Mushroom Extract för ytterligare immunstöd.'
      }
    },
    lifestyle: {
      sleep: {
        recommendation: answers.sleepQuality === 'poor' ? 'AKUT: Implementera sömnhygien omedelbart' : 'Bibehåll din goda sömnrutin',
        importance: `Under djupsömn repareras huden och HGH frisätts. ${skinType} är extra känslig för sömnbrist då ${concerns.includes('Torrhet') ? 'fuktbalansen' : 'sebumproduktionen'} störs.`,
        tips: [
          'Ställ in "night shift" på alla skärmar från kl 20',
          'Sänk rumstemperatur till 18-19°C för optimal melatonin',
          'CBD-olja internt 30 min före sömn kan förbättra sömnkvalitet',
          'Silk/satinkudde minskar friktion och rynkor'
        ]
      },
      stress: {
        currentImpact: `Din stressnivå (${answers.stressLevel}) påverkar direkt hudens kortisolnivåer vilket ${concerns.includes('Akne') ? 'triggar inflammation och utbrott' : 'bryter ner kollagen och elastin'}.`,
        techniques: [
          '4-7-8 andningsövning (4 sek in, 7 håll, 8 ut) - sänker kortisol på minuter',
          'Daglig 10-min meditation med Headspace/Calm',
          'Ashwagandha supplement (500mg) för kortisolbalans',
          'Kvällsrutin med magnesium-bad 2x/vecka'
        ],
        dailyPractice: 'Morgon: 5 min tacksamhetsjournal + 3 djupa andetag före varje måltid för parasympatisk aktivering'
      },
      exercise: {
        recommendation: answers.exerciseFrequency === 'never' ? 'Börja med 20 min promenad dagligen' : 'Optimera din träning för hudhälsa',
        skinBenefits: 'Träning ökar blodcirkulation som levererar näringsämnen till huden, svettas renar porerna, och endorfiner minskar inflammation.',
        bestTypes: [
          'Yoga - minskar kortisol och ökar flexibilitet',
          'Styrketräning - ökar HGH för kollagenproduktion',
          'HIIT - effektiv avgiftning genom svettning',
          'Simning - låg påverkan, hög cirkulation (duscha direkt efter klor)'
        ]
      },
      environment: {
        protection: 'Din livsstil kräver extra skydd mot miljöstressorer',
        seasonalAdjustments: 'Vinter: Dubbla fuktlager. Sommar: Lättare texturer + högre SPF.',
        homeEnvironment: [
          'Luftfuktare i sovrummet (40-60% fuktighet)',
          'HEPA-filter för renare luft',
          'Byt kuddfodral 2x/vecka',
          'Naturliga rengöringsprodukter utan starka kemikalier'
        ]
      }
    },
    products: {
      essentials: productRecommendations,
      advanced: [
        {
          name: 'Fungtastic Mushroom Extract',
          when: 'Efter 1 månad när grundbalansen är etablerad',
          benefits: 'Adaptogena svampar stödjer hudens immunförsvar och stresshantering',
          combination: 'Perfekt komplement till CBD/CBG för holistisk hudvård'
        }
      ],
      applicationOrder: [
        'Steg 1: Rengöring (Au Naturel)',
        'Steg 2: Behandling (Serum på fuktig hud)',
        'Steg 3: Återfuktning (Ansiktsolja)',
        'Steg 4: Skydd (SPF dagtid)'
      ],
      proTips: [
        'Värm oljan mellan handflatorna före applicering för bättre spridning',
        'Tryck försiktigt in produkter istället för att gnida',
        '"Layering" - vänta 30-60 sek mellan varje produkt',
        'Glöm inte hals och dekolletage - de åldras också!',
        'Mindre är mer - börja med små mängder och öka vid behov'
      ]
    },
    nutrition: {
      gutSkinAxis: `För ${skinType} är tarmhälsan extra viktig då ${concerns.includes('Akne') ? 'obalans i tarmfloran direkt triggar inflammation som syns som utbrott' : 'tarmens barriärfunktion påverkar hudens förmåga att hålla fukt'}. En frisk tarm = frisk hud.`,
      keyFoods: nutritionFocus,
      supplements: [
        {
          name: 'Omega-3 (EPA/DHA)',
          dosage: '2-3g dagligen',
          benefit: 'Minskar inflammation, stödjer hudbarriären',
          timing: 'Med fettrik måltid för absorption'
        },
        {
          name: 'Probiotika (minst 10 miljarder CFU)',
          dosage: '1 kapsel dagligen',
          benefit: 'Balanserar gut-skin axis',
          timing: 'På tom mage på morgonen'
        },
        {
          name: 'Vitamin D3 + K2',
          dosage: '2000-4000 IU D3 + 100mcg K2',
          benefit: 'Stödjer hudens immunförsvar och läkning',
          timing: 'Med fettrik måltid'
        },
        {
          name: 'Zink (pikolinat)',
          dosage: '15-30mg',
          benefit: 'Kritisk för sårläkning och sebumkontroll',
          timing: 'På tom mage, ej med kaffe'
        }
      ],
      avoidFoods: [
        concerns.includes('Akne') ? 'Mejeriprodukter (triggar IGF-1 och inflammation)' : '',
        'Raffinerat socker och vitt mjöl (spikar insulin = inflammation)',
        'Processad mat med tillsatser',
        'För mycket koffein (>2 koppar/dag stressar binjurarna)'
      ].filter(Boolean),
      mealPlan: {
        breakfast: 'Overnight oats med chiafrön, blåbär, valnötter och ett stekt ägg. Grönt te.',
        lunch: 'Stor sallad med grillad lax, avokado, pumpakärnor, kimchi och olivolja-citron dressing',
        dinner: 'Kyckling i kokosmjölk med gurkmeja, serverad med quinoa och ångad broccoli',
        snacks: ['Selleri med mandesmör', 'Goji-bär och macadamianötter', 'Benbuljong', 'Gurka med hummus']
      },
      hydration: {
        dailyGoal: `${Math.round(35 * 70)} ml (35ml per kg kroppsvikt)`,
        tips: [
          'Börja dagen med 500ml ljummet vatten + citron',
          'Drick ett glas vatten före varje måltid',
          'Sätt påminnelser varje timme',
          'Investera i en fin vattenflaska som motiverar'
        ],
        herbalteas: [
          'Grönt te - antioxidanter för hudskydd',
          'Rooibos - mineraler utan koffein',
          'Nässelte - kisel för kollagen',
          'Hibiskus - C-vitamin och anti-aging'
        ]
      }
    },
    sources: {
      scientificBasis: 'Denna plan är baserad på senaste forskningen inom dermatologi, endokrinologi och nutritionsvetenskap, med särskilt fokus på hur cannabinoider interagerar med hudens endocannabinoidsystem.',
      keyStudies: [
        'Bíró et al. (2009) - "The endocannabinoid system of the skin in health and disease"',
        'Oláh et al. (2014) - "Cannabidiol exerts sebostatic and antiinflammatory effects on human sebocytes"',
        'Casares et al. (2020) - "Cannabidiol induces antioxidant pathways in keratinocytes"',
        'Szabó et al. (2022) - "CBG: A promising cannabinoid for skin health applications"'
      ],
      additionalReading: [
        '"The Clear Skin Diet" av Valori Treloar - gut-skin connection',
        '"Clean" av Dr. Alejandro Junger - avgiftning för hudvård',
        '1753 Skincare E-book "Weed Your Skin" - fördjupning i CBD/CBG'
      ],
      expertNote: `${name}, din unika kombination av ${skinType} och ${concerns.join('/')} gör dig till en perfekt kandidat för cannabinoid-baserad hudvård. CBD och CBG kommer att arbeta synergistiskt med din huds naturliga system för att återställa balans och vitalitet. Var tålmodig och konsekvent - de mest dramatiska resultaten ses ofta efter 8-12 veckor. Du har alla förutsättningar för att uppnå din bästa hud någonsin!`
    }
  }
}

// Generate unique insight based on answer patterns
function generateUniqueInsight(answers: Record<string, string>, skinType: string, concerns: string[]): string {
  const insights = []
  
  if (answers.stressLevel === 'high' && concerns.includes('Akne och utbrott')) {
    insights.push('Din kombination av hög stress och akne skapar en ond cirkel där kortisol triggar mer sebum. Prioritera stresshantering för snabbare resultat.')
  }
  
  if (answers.sleepQuality === 'poor' && concerns.includes('Åldrande och fina linjer')) {
    insights.push('Sömnbrist accelererar åldrandet mer än någon annan livsstilsfaktor. Varje natt med dålig sömn = 2 dagars extra åldrande.')
  }
  
  if (answers.diet === 'poor' && skinType === 'Fet hud') {
    insights.push('Din kost kan vara den största triggern för överproduktion av sebum. Fokusera på lågt GI och omega-3 för dramatisk förbättring.')
  }
  
  if (answers.exerciseFrequency === 'never' && concerns.includes('Torrhet och flagning')) {
    insights.push('Brist på träning betyder dålig cirkulation = näringsfattig hud. Även 20 min promenad ökar syresättningen med 40%.')
  }
  
  // Default insight if no specific pattern
  if (insights.length === 0) {
    insights.push(`Din ${skinType} kombinerat med ${concerns[0]} är vanligare än du tror. Med rätt CBD/CBG-produkter och livsstilsjusteringar kan du se resultat redan inom 2 veckor.`)
  }
  
  return insights[0]
} 