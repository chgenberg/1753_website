import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

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
    return NextResponse.json({ 
      response: "Ursäkta, jag har lite tekniska problem just nu. Kan du försöka igen? Under tiden kan jag berätta att våra CBD-produkter är utmärkta för att balansera huden naturligt! 🌿"
    })
  }
} 