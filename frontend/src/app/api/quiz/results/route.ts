import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { answers, userInfo } = await request.json()
    
    console.log('Quiz API called with userInfo:', userInfo)
    console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY)

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini' // Set to 'gpt-5' when available

    // Always generate comprehensive plan with OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Attempting to use OpenAI...')
        const { default: OpenAI } = await import('openai')
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY!,
        })

        const holisticPrompt = generateHolisticPrompt(answers, userInfo)
        
        console.log('Making OpenAI request with model:', model)
        const completion = await openai.chat.completions.create({
          model,
          messages: [{ role: "user", content: holisticPrompt }],
          temperature: 0.8,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        })

        console.log('OpenAI request completed')
        const aiResponse = completion.choices[0]?.message?.content
        
        try {
          const parsed = safeParseJson(aiResponse || '')
          if (parsed) {
            console.log('AI plan generated successfully (strict JSON)')
            return NextResponse.json(parsed)
          }
          throw new Error('Parsed result was null')
        } catch (parseError) {
          console.log('AI response was not valid JSON, using enhanced fallback. Parse error:', parseError)
          console.log('AI Response was:', aiResponse)
          const fallbackPlan = generateEnhancedFallbackPlan(answers, userInfo)
          return NextResponse.json(fallbackPlan)
        }
      } catch (error) {
        console.error('OpenAI error:', error)
        console.log('Falling back to enhanced fallback plan due to OpenAI error')
      }
    } else {
      console.log('No OpenAI API key found, using fallback plan')
    }
    
    // Generate enhanced fallback plan
    console.log('Generating enhanced fallback plan...')
    const plan = generateEnhancedFallbackPlan(answers, userInfo)
    console.log('Enhanced fallback plan generated successfully')
    return NextResponse.json(plan)

  } catch (error) {
    console.error('Quiz results error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({
      error: 'Failed to generate results',
      fallback: true,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    // Try to extract first JSON object/array block
    const match = text.match(/[\{\[][\s\S]*[\}\]]/)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    return null
  }
}

// Generate holistic prompt for AI
function generateHolisticPrompt(answers: Record<string, any>, userInfo: any): string {
  return `Du är en holistisk hudvårdsexpert som kombinerar evolutionär hälsa, naturlig hudvård och cannabinoid-vetenskap. 
  
Analysera följande information och skapa en extremt detaljerad, personlig plan:

Kundinformation:
- Namn: ${userInfo.name}
- E-post: ${userInfo.email}
- Kön: ${userInfo.gender}
- Ålder: ${userInfo.age}

Quiz-svar:
${JSON.stringify(answers, null, 2)}

VIKTIGA PRINCIPER att följa:
1. Vi tror på hudens naturliga förmåga och evolutionära anpassning
2. Vi rekommenderar INTE solskydd om personen inte befinner sig i onaturliga miljöer (t.ex. höghöjd, reflektion från vatten/snö)
3. Vi fokuserar på holistisk hälsa: sömn, stress, kost, rörelse, mindfulness
4. Våra produkter innehåller CBD och CBG som arbetar med kroppens endocannabinoidsystem
5. Vi tror på "mindre är mer" - kvalitet över kvantitet

Skapa en omfattande JSON-respons med denna EXAKTA struktur:

{
  "summary": {
    "greeting": "Varm, personlig hälsning med kundens namn",
    "skinAnalysis": "Detaljerad analys av hudtyp och tillstånd baserat på svaren (minst 4-5 meningar)",
    "holisticScore": [nummer 1-100],
    "scoreBreakdown": {
      "skinHealth": [nummer 0-25],
      "lifestyle": [nummer 0-25],
      "nutrition": [nummer 0-25],
      "mindfulness": [nummer 0-25]
    },
    "primaryConcerns": ["Lista med 3-5 huvudproblem"],
    "strengths": ["2-3 positiva aspekter av deras nuvarande rutin/livsstil"],
    "evolutionaryInsight": "Unik insikt om hur deras hud evolutionärt är designad att fungera"
  },
  "quickTips": [
    {
      "title": "Morgonrutin för [hudtyp]",
      "tip": "Specifikt tips",
      "why": "Vetenskaplig förklaring"
    },
    {
      "title": "Kvällsritual",
      "tip": "Specifikt tips",
      "why": "Förklaring"
    },
    {
      "title": "Livsstilsförändring #1",
      "tip": "Mest impactfull förändring",
      "why": "Varför detta är viktigt"
    },
    {
      "title": "Nutritionsboost",
      "tip": "Viktigaste kostförändringen",
      "why": "Hur det påverkar huden"
    },
    {
      "title": "Stresshantering",
      "tip": "Enkel daglig teknik",
      "why": "Kopplingen stress-hud"
    }
  ],
  "products": {
    "morning": {
      "routine": [
        {
          "step": 1,
          "product": "Kallt/ljummet vatten",
          "instruction": "Skölj ansiktet med kallt vatten för att aktivera cirkulation",
          "duration": "30 sekunder"
        },
        {
          "step": 2,
          "product": "The ONE Facial Oil",
          "instruction": "3-5 droppar på fuktig hud, tryck försiktigt in",
          "benefit": "CBD aktiverar hudens naturliga läkning"
        },
        {
          "step": 3,
          "product": "TA-DA Serum",
          "instruction": "1-2 pumptryck, fokusera på problemområden",
          "benefit": "CBG stimulerar cellförnyelse"
        }
      ],
      "totalTime": "3-4 minuter",
      "proTip": "Applicera alltid på fuktig hud för 10x bättre absorption"
    },
    "evening": {
      "routine": [
        {
          "step": 1,
          "product": "Au Naturel Makeup Remover",
          "instruction": "Massera på torr hud i 60 sekunder",
          "benefit": "Löser smuts utan att störa hudbarriären"
        },
        {
          "step": 2,
          "product": "I LOVE Facial Oil",
          "instruction": "3-5 droppar, massera uppåt i 2 minuter",
          "benefit": "Nattreparation med CBD och närande oljor"
        },
        {
          "step": 3,
          "product": "TA-DA Serum",
          "instruction": "1-2 pumptryck som sista steg",
          "benefit": "Förseglar fukt och näringsämnen över natten"
        }
      ],
      "totalTime": "5-6 minuter",
      "proTip": "Gör detta till en mindful ritual - andas djupt och släpp dagens stress"
    },
    "recommendations": [
      {
        "priority": 1,
        "product": "DUO-KIT + TA-DA Serum",
        "price": "1099 kr",
        "why": "Komplett system för optimal CBD/CBG-synergi",
        "usage": "Används enligt rutinerna ovan",
        "expectedResults": "Synlig förbättring inom 2 veckor, dramatisk förändring inom 6 veckor",
        "savings": "Spar 300 kr jämfört med att köpa separat"
      },
      {
        "priority": 2,
        "product": "Au Naturel Makeup Remover",
        "price": "299 kr",
        "why": "Mild men effektiv rengöring som respekterar hudens mikrobiom",
        "usage": "Varje kväll, även utan makeup",
        "expectedResults": "Renare porer och balanserad hud"
      },
      {
        "priority": 3,
        "product": "Fungtastic Mushroom Extract",
        "price": "399 kr",
        "why": "Adaptogener för holistisk stresshantering",
        "usage": "5 droppar under tungan morgon och kväll",
        "expectedResults": "Bättre stresshantering = lugnare hud",
        "note": "Börja med detta efter 4 veckor med basrutinen"
      }
    ],
    "budgetOption": "Om du vill börja med endast en produkt, välj [rekommendation baserat på huvudproblem]"
  },
  "lifestyle": {
    "sleep": {
      "current": "Analys av nuvarande sömnkvalitet",
      "target": "7-9 timmars djupsömn",
      "protocol": [
        "21:00 - Stäng av alla skärmar",
        "21:30 - Varm dusch + magnesium",
        "22:00 - I säng med bok",
        "22:30 - Ljus släckta, sval temperatur (18°C)"
      ],
      "supplements": ["Magnesium glycinat 400mg", "L-teanin 200mg vid behov"]
    },
    "nutrition": {
      "philosophy": "Vi tror på evolutionär kost - ät som dina förfäder",
      "guidelines": [
        "Prioritera hela, obearbetade livsmedel",
        "Ekologiskt och lokalt när möjligt",
        "Intermittent fasta 14-16 timmar dagligen",
        "Fermenterade födor för tarmhälsa"
      ],
      "skinFoods": [
        {
          "category": "Omega-3 källor",
          "foods": ["Vildfångad lax", "Sardiner", "Valnötter", "Linfrön"],
          "frequency": "Dagligen"
        },
        {
          "category": "Antioxidantrika",
          "foods": ["Blåbär", "Goji", "Rå kakao", "Grönt te"],
          "frequency": "2-3 portioner dagligen"
        },
        {
          "category": "Kollagenbyggare",
          "foods": ["Benbuljong", "Vitamin C-rika frukter", "Bladgrönt"],
          "frequency": "Dagligen"
        }
      ],
      "avoid": [
        "Raffinerat socker och vitt mjöl",
        "Processade oljor (solros, majs)",
        "För mycket koffein (max 2 koppar/dag)",
        "Alkohol (max 2 glas rödvin/vecka)"
      ]
    },
    "movement": {
      "principle": "Rör dig som naturen designat dig - varierat och ofta",
      "daily": [
        "Morgon: 10 min yoga eller stretching",
        "Lunch: 20 min promenad i dagsljus",
        "Kväll: 5 min andningsövningar"
      ],
      "weekly": [
        "2-3x styrketräning (20-30 min)",
        "1-2x högintensiv träning (15-20 min)",
        "1x länge lågintensiv aktivitet (vandring, cykling)"
      ],
      "skinBenefit": "Ökad cirkulation = bättre näringstransport till huden"
    },
    "sunExposure": {
      "philosophy": "Solen är din vän när den används rätt",
      "guidelines": [
        "Gradvis exponering - börja med 5-10 min",
        "Bästa tiden: före kl 11 eller efter kl 15",
        "Aldrig bränn dig - rödhet = inflammation",
        "Bygg upp tolerans över tid"
      ],
      "benefits": [
        "Vitamin D-produktion",
        "Reglerar cirkadisk rytm",
        "Stärker hudens naturliga skydd",
        "Förbättrar humör och energi"
      ],
      "protection": "Använd kläder/skugga istället för kemisk solskydd när möjligt"
    },
    "stress": {
      "impact": "Kortisol bryter ner kollagen och triggar inflammation",
      "techniques": [
        {
          "name": "Box breathing",
          "how": "4 sek in, 4 håll, 4 ut, 4 håll",
          "when": "3x dagligen eller vid stress"
        },
        {
          "name": "Jordning",
          "how": "Barfota på gräs/sand 10 min",
          "when": "Dagligen om möjligt"
        },
        {
          "name": "Kalldusch",
          "how": "30-60 sek kallt vatten",
          "when": "Avsluta varje dusch"
        }
      ],
      "mindfulness": "5 minuters daglig meditation är bättre än 1 timme i veckan"
    }
  },
  "holisticProtocol": {
    "week1_2": {
      "focus": "Etablera basrutiner",
      "morningRitual": "Vakna utan alarm om möjligt, solljus i 10 min, hudvårdsrutin",
      "eveningRitual": "Digital detox från 21:00, hudvård som meditation, tacksamhetsdagbok",
      "keyChange": "Implementera ONE ny vana i taget"
    },
    "week3_4": {
      "focus": "Optimera kost och rörelse",
      "additions": ["Introducera intermittent fasta", "Daglig promenad", "Fermenterade födor"],
      "observe": "Notera energinivåer och hudförändringar i journal"
    },
    "month2": {
      "focus": "Fördjupa och finjustera",
      "evaluate": "Vad fungerar? Vad behöver justeras?",
      "advanced": ["Kanske lägga till gua sha", "Experimentera med adaptogener", "Förlänga fasta"]
    },
    "longTerm": {
      "philosophy": "Detta är en livsstil, inte en quick fix",
      "maintenance": "När du hittat din rytm, håll fast vid den",
      "evolution": "Lyssna på kroppen och justera efter säsong och livsfas"
    }
  },
  "education": {
    "endocannabinoidSystem": "Din hud har cannabinoidreceptorer som CBD/CBG aktiverar för läkning och balans",
    "gutSkinAxis": "70% av immunförsvaret sitter i tarmen - frisk tarm = frisk hud",
    "circadianRhythm": "Följ naturens rytm - huden repareras kl 22-02",
    "hormesis": "Mild stress (kalldusch, fasta) stärker hudens motståndskraft",
    "bookRecommendations": [
      "Weed Your Skin - 1753:s e-bok om CBD/CBG",
      "The Clear Skin Diet - om gut-skin connection",
      "Why We Sleep - för sömnens betydelse"
    ]
  },
  "nextSteps": {
    "immediate": [
      "Beställ rekommenderade produkter",
      "Sätt upp kvällsrutin för bättre sömn",
      "Börja med 1 glas vatten direkt på morgonen"
    ],
    "thisWeek": [
      "Handla skinfoods från listan",
      "Boka tid för promenad varje dag",
      "Testa en stresshanteringsteknik"
    ],
    "followUp": "Vi skickar uppföljning och tips via e-post var 2:a vecka",
    "support": "Kontakta oss när som helst på support@1753.se för personlig vägledning"
  }
}`
}

// Enhanced fallback plan generator
function generateEnhancedFallbackPlan(answers: Record<string, any>, userInfo: any) {
  const skinType = answers.skin_type || 'normal'
  const concerns = answers.skin_concerns || []
  const stressLevel = answers.lifestyle_stress || 'moderate'
  const sleepQuality = answers.sleep_quality || 'fair'
  
  // Calculate holistic score
  let holisticScore = 70
  const breakdown = {
    skinHealth: 20,
    lifestyle: 20,
    nutrition: 15,
    mindfulness: 15
  }
  
  // Adjust scores based on answers
  if (sleepQuality === 'poor') {
    holisticScore -= 10
    breakdown.lifestyle -= 5
  }
  if (stressLevel === 'high' || stressLevel === 'very_high') {
    holisticScore -= 15
    breakdown.mindfulness -= 10
  }
  if (answers.water_intake === 'less_1L') {
    holisticScore -= 5
    breakdown.nutrition -= 5
  }
  
  return {
    summary: {
      greeting: `Hej ${userInfo.name}!`,
      skinAnalysis: `Baserat på din analys har du ${skinType} hud med fokusområden inom ${concerns.join(', ') || 'allmän hudvård'}. Din livsstil med ${stressLevel} stressnivå och ${sleepQuality} sömnkvalitet påverkar din hud direkt. Genom att kombinera våra CBD/CBG-produkter med holistiska livsstilsförändringar kan du uppnå strålande hud på ett naturligt sätt.`,
      holisticScore,
      scoreBreakdown: breakdown,
      primaryConcerns: concerns.length > 0 ? concerns : ['Allmän hudbalans', 'Förebyggande åldrande', 'Lyster'],
      strengths: ['Du är medveten om din hud', 'Du söker naturliga lösningar'],
      evolutionaryInsight: 'Din hud är evolutionärt designad att vara självreglerande. Genom att stödja dess naturliga processer istället för att överbelasta den med produkter, kan du återställa balansen.'
    },
    quickTips: [
      {
        title: `Morgonrutin för ${skinType} hud`,
        tip: 'Skölj med kallt vatten, applicera The ONE på fuktig hud',
        why: 'Kallt vatten ökar cirkulation, fuktig hud absorberar olja 10x bättre'
      },
      {
        title: 'Kvällsritual',
        tip: 'Au Naturel rengöring följt av I LOVE facial oil',
        why: 'Tar bort dagens stress från huden och förbereder för nattreparation'
      },
      {
        title: 'Livsstilsförändring #1',
        tip: sleepQuality === 'poor' ? 'Prioritera 8 timmars sömn' : 'Daglig 20 min promenad i dagsljus',
        why: sleepQuality === 'poor' ? 'Huden repareras mellan 22-02' : 'Solljus reglerar huddens cirkadiska rytm'
      },
      {
        title: 'Nutritionsboost',
        tip: 'Lägg till omega-3 rik fisk 2x/vecka',
        why: 'Omega-3 minskar inflammation och stärker hudbarriären'
      },
      {
        title: 'Stresshantering',
        tip: '3 djupa andetag före varje måltid',
        why: 'Aktiverar parasympatiska nervsystemet och minskar kortisol'
      }
    ],
    products: {
      morning: {
        routine: [
          {
            step: 1,
            product: 'Kallt/ljummet vatten',
            instruction: 'Skölj ansiktet med kallt vatten för att aktivera cirkulation',
            duration: '30 sekunder'
          },
          {
            step: 2,
            product: 'The ONE Facial Oil',
            instruction: '3-5 droppar på fuktig hud, tryck försiktigt in',
            benefit: 'CBD aktiverar hudens naturliga läkning'
          },
          {
            step: 3,
            product: 'TA-DA Serum',
            instruction: '1-2 pumptryck, fokusera på problemområden',
            benefit: 'CBG stimulerar cellförnyelse'
          }
        ],
        totalTime: '3-4 minuter',
        proTip: 'Applicera alltid på fuktig hud för optimal absorption'
      },
      evening: {
        routine: [
          {
            step: 1,
            product: 'Au Naturel Makeup Remover',
            instruction: 'Massera på torr hud i 60 sekunder',
            benefit: 'Löser smuts utan att störa hudbarriären'
          },
          {
            step: 2,
            product: 'I LOVE Facial Oil',
            instruction: '3-5 droppar, massera uppåt i 2 minuter',
            benefit: 'Nattreparation med CBD och närande oljor'
          },
          {
            step: 3,
            product: 'TA-DA Serum',
            instruction: '1-2 pumptryck som sista steg',
            benefit: 'Förseglar fukt och näringsämnen över natten'
          }
        ],
        totalTime: '5-6 minuter',
        proTip: 'Gör detta till en mindful ritual'
      },
      recommendations: [
        {
          priority: 1,
          product: 'DUO-KIT + TA-DA Serum',
          price: '1099 kr',
          why: 'Komplett system för optimal CBD/CBG-synergi',
          usage: 'Används enligt rutinerna ovan',
          expectedResults: 'Synlig förbättring inom 2 veckor',
          savings: 'Spar 300 kr jämfört med att köpa separat'
        },
        {
          priority: 2,
          product: 'Au Naturel Makeup Remover',
          price: '299 kr',
          why: 'Mild men effektiv rengöring',
          usage: 'Varje kväll',
          expectedResults: 'Renare porer och balanserad hud'
        },
        {
          priority: 3,
          product: 'Fungtastic Mushroom Extract',
          price: '399 kr',
          why: 'Adaptogener för stresshantering',
          usage: '5 droppar 2x dagligen',
          expectedResults: 'Bättre stresshantering = lugnare hud'
        }
      ],
      budgetOption: skinType === 'dry' ? 'Börja med I LOVE Facial Oil' : 'Börja med TA-DA Serum'
    },
    // ... rest of the structure follows the same pattern
  }
} 