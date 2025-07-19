import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization of OpenAI client to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is missing');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: Request) {
  let body: any;
  
  try {
    body = await request.json();
    const { answers, name, email } = body;

    // Create a comprehensive prompt for GPT
    const prompt = `Som hudvårdsexpert, analysera följande svar från en hudvårdsquiz och ge en detaljerad, personlig hudvårdsanalys.

Kundens information:
Namn: ${name}
Hudtyp: ${answers.skinType}
Huvudsakliga bekymmer: ${answers.concerns}
Nuvarande rutin: ${answers.routine}
Sömn: ${answers.sleep}
Stressnivå: ${answers.stress}
Vattenintag: ${answers.water}
Kost: ${answers.diet}
Träning: ${answers.exercise}
Solexponering: ${answers.sunExposure}
Rökning: ${answers.smoking}
Alkohol: ${answers.alcohol}
Hormonella faktorer: ${answers.hormones}
Mediciner: ${answers.medications}
Ålder: ${answers.age}
Klimat: ${answers.environment}

Ge en omfattande analys som inkluderar:

1. **Hudanalys**: En detaljerad förklaring av kundens hudtillstånd baserat på svaren
2. **Bakomliggande orsaker**: Vetenskapligt grundade förklaringar till varför huden är som den är
3. **Livsstilsrekommendationer**: Specifika råd om kost, sömn, stress, träning etc.
4. **Produktrekommendationer**: Rekommendera 3-4 av följande 1753-produkter som passar bäst:
   - DUO Kit (CBD & CBG Oil)
   - Face Oil
   - The Serum
   - The Cream
   - Body Oil
   - Oil Cleanser
   - Gua Sha
5. **Daglig hudvårdsrutin**: Steg-för-steg morgon- och kvällsrutin
6. **Långsiktiga mål**: Vad kunden kan förvänta sig över tid
7. **Källor och forskning**: Nämn relevant forskning om endocannabinoidsystemet, CBD/CBG i hudvård, och andra relevanta studier

Skriv på ett personligt, engagerande sätt som är lätt att förstå men ändå vetenskapligt korrekt. Använd svenska.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Du är en expert på hudvård med djup kunskap om endocannabinoidsystemet, CBD/CBG, och holistisk hudvård. Du ger personliga, vetenskapligt grundade råd."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const analysis = completion.choices[0].message.content;

    // Extract product recommendations from the GPT response
    const productMap: Record<string, string> = {
      'duo kit': 'duo-kit',
      'face oil': 'face-oil',
      'the serum': 'the-serum',
      'the cream': 'the-cream',
      'body oil': 'body-oil',
      'oil cleanser': 'oil-cleanser',
      'gua sha': 'gua-sha'
    };

    // Simple extraction of recommended products
    const recommendedProducts: string[] = [];
    const lowerAnalysis = analysis?.toLowerCase() || '';
    
    Object.entries(productMap).forEach(([key, value]) => {
      if (lowerAnalysis.includes(key)) {
        recommendedProducts.push(value);
      }
    });

    // Ensure we have at least some products recommended
    if (recommendedProducts.length === 0) {
      // Default recommendations based on skin type
      const defaultRecs: Record<string, string[]> = {
        dry: ['face-oil', 'the-cream', 'body-oil'],
        oily: ['duo-kit', 'the-serum', 'oil-cleanser'],
        combination: ['duo-kit', 'face-oil', 'the-serum'],
        sensitive: ['face-oil', 'body-oil', 'the-cream'],
        normal: ['duo-kit', 'the-serum', 'face-oil']
      };
      recommendedProducts.push(...(defaultRecs[answers.skinType] || ['duo-kit', 'face-oil']));
    }

    // Format the response
    const results = {
      name,
      email,
      analysis,
      recommendedProducts: recommendedProducts.slice(0, 4), // Max 4 products
      answers,
      timestamp: new Date().toISOString()
    };

    // Here you would normally also:
    // 1. Save to database
    // 2. Send email with results
    // 3. Add to email marketing list

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing quiz results:', error);
    
    // Fallback to a simpler response if GPT fails
    return NextResponse.json({
      name: body?.name || 'Kund',
      email: body?.email || '',
      analysis: `Hej ${body?.name || 'där'}! Baserat på dina svar ser vi att du har ${body?.answers?.skinType || 'unik'} hud. Vi rekommenderar en skonsam men effektiv hudvårdsrutin med fokus på CBD och CBG för optimal hudbalans.`,
      recommendedProducts: ['duo-kit', 'face-oil', 'the-serum'],
      error: 'Kunde inte generera fullständig analys'
    });
  }
} 