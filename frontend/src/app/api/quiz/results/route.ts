import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { answers, userInfo, imageMetrics } = await request.json()
    
    console.log('Quiz API called with userInfo:', userInfo)
    console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY)

    const model = process.env.OPENAI_MODEL || 'gpt-5-mini' // Set to 'gpt-5' when available

    // Always generate comprehensive plan with OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Attempting to use OpenAI...')
        const { default: OpenAI } = await import('openai')
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY!,
        })

        const holisticPrompt = generateHolisticPrompt(answers, userInfo, imageMetrics)
        
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
            const normalized = normalizeResults(parsed)
            return NextResponse.json(normalized)
          }
          throw new Error('Parsed result was null')
        } catch (parseError) {
          console.log('AI response was not valid JSON, using enhanced fallback. Parse error:', parseError)
          console.log('AI Response was:', aiResponse)
          const fallbackPlan = generateEnhancedFallbackPlan(answers, userInfo, imageMetrics)
          return NextResponse.json(normalizeResults(fallbackPlan))
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
    const plan = generateEnhancedFallbackPlan(answers, userInfo, imageMetrics)
    console.log('Enhanced fallback plan generated successfully')
    return NextResponse.json(normalizeResults(plan))

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

function toStringValue(val: any): string {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return val.map(toStringValue).join(', ')
  if (typeof val === 'object') return Object.values(val).map(toStringValue).join(' ')
  return String(val)
}

function normalizeResults(input: any) {
  const r: any = { ...input }
  r.summary = r.summary || {}
  r.quickTips = Array.isArray(r.quickTips) ? r.quickTips : []
  r.products = r.products || {}
  r.products.morning = r.products.morning || { routine: [], totalTime: '', proTip: '' }
  r.products.evening = r.products.evening || { routine: [], totalTime: '', proTip: '' }

  // Normalize lifestyle container
  r.lifestyle = r.lifestyle || {}
  // If top-level nutrition exists, fold into lifestyle
  if (r.nutrition && !r.lifestyle.nutrition) r.lifestyle.nutrition = r.nutrition
  if (r.stress && !r.lifestyle.stress) r.lifestyle.stress = r.stress
  if (r.movement && !r.lifestyle.movement) r.lifestyle.movement = r.movement
  if (r.sunExposure && !r.lifestyle.sunExposure) r.lifestyle.sunExposure = r.sunExposure

  // Coerce lifestyle subfields to strings/arrays of strings as UI expects
  if (r.lifestyle.nutrition) {
    const n = r.lifestyle.nutrition
    n.philosophy = toStringValue(n.philosophy)
    n.guidelines = Array.isArray(n.guidelines) ? n.guidelines.map(toStringValue) : []
    n.skinFoods = Array.isArray(n.skinFoods) ? n.skinFoods : []
    n.avoid = Array.isArray(n.avoid) ? n.avoid.map(toStringValue) : []
  }
  if (r.lifestyle.sleep) {
    const s = r.lifestyle.sleep
    s.current = toStringValue(s.current)
    s.target = toStringValue(s.target)
    s.protocol = Array.isArray(s.protocol) ? s.protocol.map(toStringValue) : []
  }
  if (r.lifestyle.movement) {
    const m = r.lifestyle.movement
    m.principle = toStringValue(m.principle)
    m.daily = Array.isArray(m.daily) ? m.daily.map(toStringValue) : []
    m.weekly = Array.isArray(m.weekly) ? m.weekly.map(toStringValue) : []
  }
  if (r.lifestyle.stress) {
    const s = r.lifestyle.stress
    s.impact = toStringValue(s.impact)
    if (Array.isArray(s.techniques)) {
      s.techniques = s.techniques.map((t: any) => ({
        name: toStringValue(t?.name),
        how: toStringValue(t?.how),
        when: toStringValue(t?.when)
      }))
    } else {
      s.techniques = []
    }
  }
  if (r.lifestyle.sunExposure) {
    const se = r.lifestyle.sunExposure
    se.philosophy = toStringValue(se.philosophy)
    se.guidelines = Array.isArray(se.guidelines) ? se.guidelines.map(toStringValue) : []
    se.benefits = Array.isArray(se.benefits) ? se.benefits.map(toStringValue) : []
  }

  // Ensure holisticProtocol is an object
  r.holisticProtocol = r.holisticProtocol || {}

  return r
}

// Generate holistic prompt for AI
function generateHolisticPrompt(answers: Record<string, any>, userInfo: any, imageMetrics?: any): string {
  const imageSection = imageMetrics ? `\n\nBildbaserade zonmått (skala 0-100 där relevant):\n${JSON.stringify(imageMetrics, null, 2)}\n\nTolka värdena så här kortfattat:\n- meanLuminance (0-255): låg = mörk/exponeringsbrist, hög = överexponerad.\n- rednessIndex (0-100): högre = mer rodnad/erytem.\n- highlightRatio (%): högre = mer glans/oljighet.\n- textureVariance: högre = mer ojämn textur/porighet.\nAnvänd värdena som stöd för zon-specifika råd (t.ex. mer glans på näsa → mattande tips).` : '\n\n(Inga bildmått angivna – basera råden på quizsvar)'

  return `Du är en holistisk hudvårdsexpert som kombinerar evolutionär hälsa, naturlig hudvård och cannabinoid-vetenskap. 
  
Analysera följande information och skapa en extremt detaljerad, personlig plan:

Kundinformation:
- Namn: ${userInfo.name}
- E-post: ${userInfo.email}
- Kön: ${userInfo.gender}
- Ålder: ${userInfo.age}

Quiz-svar:
${JSON.stringify(answers, null, 2)}
${imageSection}

VIKTIGA PRINCIPER att följa:
1. Vi tror på hudens naturliga förmåga och evolutionära anpassning
2. Vi rekommenderar INTE solskydd om personen inte befinner sig i onaturliga miljöer (t.ex. höghöjd, reflektion från vatten/snö)
3. Vi fokuserar på holistisk hälsa: sömn, stress, kost, rörelse, mindfulness
4. Våra produkter innehåller CBD och CBG som arbetar med kroppens endocannabinoidsystem
5. Vi tror på "mindre är mer" - kvalitet över kvantitet

Skapa en omfattande JSON-respons med denna EXAKTA struktur:
${JSON.stringify(exampleStructure, null, 2)}`
}

// Example structure used in prompt (kept short by reference)
const exampleStructure = {
  summary: {
    greeting: "",
    skinAnalysis: "",
    holisticScore: 0,
    scoreBreakdown: { skinHealth: 0, lifestyle: 0, nutrition: 0, mindfulness: 0 },
    primaryConcerns: [],
    strengths: [],
    evolutionaryInsight: ""
  },
  quickTips: [],
  products: { morning: { routine: [], totalTime: "", proTip: "" }, evening: { routine: [], totalTime: "", proTip: "" }, recommendations: [], budgetOption: "" },
  lifestyle: {},
  holisticProtocol: {},
  education: {},
  nextSteps: {}
}

// Enhanced fallback plan generator (now considers imageMetrics)
function generateEnhancedFallbackPlan(answers: Record<string, any>, userInfo: any, imageMetrics?: any) {
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

  // Adjust using image metrics if present (simple heuristics)
  let notes: string[] = []
  if (imageMetrics?.zones) {
    const z = imageMetrics.zones
    const avgHighlight = avg([z.forehead?.highlightRatio, z.nose?.highlightRatio, z.leftCheek?.highlightRatio, z.rightCheek?.highlightRatio, z.chin?.highlightRatio])
    const cheeksRedness = avg([z.leftCheek?.rednessIndex, z.rightCheek?.rednessIndex])
    const texture = avg([z.forehead?.textureVariance, z.leftCheek?.textureVariance, z.rightCheek?.textureVariance, z.chin?.textureVariance])

    if (avgHighlight > 8) {
      notes.push('Ökad glans upptäckt – föreslå mattande tips för T‑zon och balanserande oljor.')
    }
    if (cheeksRedness > 15) {
      notes.push('Rodnad på kinder – prioritera lugnande råd och milda produkter.')
    }
    if (texture > 1200) {
      notes.push('Ojämn textur – fokusera på skonsam exfoliering och barriärstöd.')
    }
  }
  
  const plan = {
    summary: {
      greeting: `Hej ${userInfo.name}!`,
      skinAnalysis: `Baserat på din analys har du ${skinType} hud med fokusområden inom ${concerns.join(', ') || 'allmän hudvård'}. ${notes.join(' ')}`.trim(),
      holisticScore,
      scoreBreakdown: breakdown,
      primaryConcerns: concerns.length > 0 ? concerns : ['Allmän hudbalans', 'Förebyggande åldrande', 'Lyster'],
      strengths: ['Du är medveten om din hud', 'Du söker naturliga lösningar'],
      evolutionaryInsight: 'Din hud är evolutionärt designad att vara självreglerande. Genom att stödja dess naturliga processer istället för att överbelasta den med produkter, kan du återställa balansen.'
    },
    quickTips: [
      { title: `Morgonrutin för ${skinType} hud`, tip: 'Skölj med kallt vatten, applicera The ONE på fuktig hud', why: 'Kallt vatten ökar cirkulation, fuktig hud absorberar olja 10x bättre' },
      { title: 'Kvällsritual', tip: 'Au Naturel rengöring följt av I LOVE facial oil', why: 'Tar bort dagens stress från huden och förbereder för nattreparation' },
      { title: 'Livsstilsförändring #1', tip: sleepQuality === 'poor' ? 'Prioritera 8 timmars sömn' : 'Daglig 20 min promenad i dagsljus', why: sleepQuality === 'poor' ? 'Huden repareras mellan 22-02' : 'Solljus reglerar huddens cirkadiska rytm' },
      { title: 'Nutritionsboost', tip: 'Lägg till omega-3 rik fisk 2x/vecka', why: 'Omega-3 minskar inflammation och stärker hudbarriären' },
      { title: 'Stresshantering', tip: '3 djupa andetag före varje måltid', why: 'Aktiverar parasympatiska nervsystemet och minskar kortisol' }
    ],
    products: {
      morning: {
        routine: [
          { step: 1, product: 'Kallt/ljummet vatten', instruction: 'Skölj ansiktet med kallt vatten för att aktivera cirkulation', duration: '30 sekunder' },
          { step: 2, product: 'The ONE Facial Oil', instruction: '3-5 droppar på fuktig hud, tryck försiktigt in', benefit: 'CBD aktiverar hudens naturliga läkning' },
          { step: 3, product: 'TA-DA Serum', instruction: '1-2 pumptryck, fokusera på problemområden', benefit: 'CBG stimulerar cellförnyelse' }
        ],
        totalTime: '3-4 minuter',
        proTip: (imageMetrics?.zones?.nose?.highlightRatio || 0) > 8 ? 'Pressa in oljan i tunn film, undvik T‑zon vid glans.' : 'Applicera alltid på fuktig hud för optimal absorption'
      },
      evening: {
        routine: [
          { step: 1, product: 'Au Naturel Makeup Remover', instruction: 'Massera på torr hud i 60 sekunder', benefit: 'Löser smuts utan att störa hudbarriären' },
          { step: 2, product: 'I LOVE Facial Oil', instruction: '3-5 droppar, massera uppåt i 2 minuter', benefit: 'Nattreparation med CBD och närande oljor' },
          { step: 3, product: 'TA-DA Serum', instruction: '1-2 pumptryck som sista steg', benefit: 'Förseglar fukt och näringsämnen över natten' }
        ],
        totalTime: '5-6 minuter',
        proTip: 'Gör detta till en mindful ritual'
      },
      recommendations: [
        { priority: 1, product: 'DUO-KIT + TA-DA Serum', price: '1099 kr', why: 'Komplett system för optimal CBD/CBG-synergi', usage: 'Används enligt rutinerna ovan', expectedResults: 'Synlig förbättring inom 2 veckor', savings: 'Spar 300 kr jämfört med att köpa separat' },
        { priority: 2, product: 'Au Naturel Makeup Remover', price: '299 kr', why: 'Mild men effektiv rengöring', usage: 'Varje kväll', expectedResults: 'Renare porer och balanserad hud' },
        { priority: 3, product: 'Fungtastic Mushroom Extract', price: '399 kr', why: 'Adaptogener för stresshantering', usage: '5 droppar 2x dagligen', expectedResults: 'Bättre stresshantering = lugnare hud' }
      ],
      budgetOption: skinType === 'dry' ? 'Börja med I LOVE Facial Oil' : 'Börja med TA-DA Serum'
    },
    lifestyle: {
      sleep: {
        current: 'Analys av nuvarande sömnkvalitet',
        target: '7-9 timmars djupsömn',
        protocol: ['21:00 - Stäng av alla skärmar', '21:30 - Varm dusch + magnesium', '22:00 - I säng med bok', '22:30 - Ljus släckta, sval temperatur (18°C)']
      }
    }
  }
  return plan
}

function avg(arr: Array<number | undefined>) {
  const v = arr.filter((x): x is number => typeof x === 'number')
  if (!v.length) return 0
  return v.reduce((a, b) => a + b, 0) / v.length
} 