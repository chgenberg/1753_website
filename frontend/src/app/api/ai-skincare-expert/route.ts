import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if OpenAI API key is available at runtime
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        response: generateFallbackResponse(message, context)
      })
    }

    // Import OpenAI dynamically to avoid build-time errors
    const { default: OpenAI } = await import('openai')
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const systemPrompt = `Du är en AI Hudexpert för 1753 SKINCARE. Du är kunnig, vänlig och hjälpsam.

VIKTIG INFORMATION OM ANVÄNDAREN:
- Namn: ${context.userName}
- Hudtyp: ${context.skinType}
- Hudbekymmer: ${context.concerns.join(', ')}

DIN ROLL:
1. Du är en opartisk men säljande rådgivare för 1753 SKINCARE
2. Du ger holistiska råd om hud, hudvård och hudhälsa
3. Du fokuserar på naturliga lösningar och endocannabinoidsystemet
4. Du rekommenderar 1753-produkter när det är relevant

PRODUKTER DU KAN REKOMMENDERA:
- DUO Face Oil: För torr och mogen hud, med CBD och CBG
- THE Serum: För fet/blandhy och aknebenägen hud
- Au Naturel Cleanser: Mild rengöring för alla hudtyper
- Fungtastic Face Cream: Närande kräm med svampextrakt
- I LOVE Face Mask: Lugnande mask med CBD

SVARA ALLTID:
- På svenska
- Personligt (använd kundens namn ibland)
- Informativt men koncist
- Med fokus på naturlig hudvård
- Inkludera emojis för vänlighet

OM FRÅGAN INTE ÄR HUDRELATERAD:
Svara vänligt: "Jag kan tyvärr inte svara på den frågan men fråga mig gärna något annat om hud, hudvård eller hudhälsa. 😊"`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Skincare Expert error:', error)
    
    // Fallback response if OpenAI fails
    const { message, context } = await request.json()
    return NextResponse.json({ 
      response: generateFallbackResponse(message, context)
    })
  }
}

function generateFallbackResponse(message: string, context?: any): string {
  const lowerMessage = message?.toLowerCase() || ''
  
  // Check if it's a skin-related question
  const skinKeywords = ['hud', 'akne', 'torr', 'fet', 'känslig', 'rynkor', 'rodnad', 'eksem', 'psoriasis', 'cbd', 'cbg', 'serum', 'kräm', 'olja', 'rengöring']
  const isSkinRelated = skinKeywords.some(keyword => lowerMessage.includes(keyword))
  
  if (!isSkinRelated) {
    return "Jag kan tyvärr inte svara på den frågan men fråga mig gärna något annat om hud, hudvård eller hudhälsa. 😊"
  }
  
  // Provide generic but helpful responses for common topics
  if (lowerMessage.includes('akne')) {
    return "Akne kan ha många orsaker, från hormoner till kost och stress. Våra CBD-produkter kan hjälpa till att balansera hudens oljeproduktion och minska inflammation. Vill du veta mer om någon specifik produkt?"
  }
  
  if (lowerMessage.includes('torr')) {
    return "Torr hud behöver både fukt och näring. Våra oljor med CBD och CBG hjälper till att återställa hudbarriären. DUO Face Oil är särskilt bra för torr hud. Vill du ha fler tips?"
  }
  
  return "Det är en intressant fråga! Baserat på din hudtyp och behov skulle jag rekommendera att fokusera på att stärka din hudbarriär med naturliga ingredienser som CBD och CBG. Vill du att jag går in mer på detaljer?"
} 