import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface QuizAnswers {
  skinType: string
  concerns: string[]
  lifestyle: string[]
  currentProducts: string[]
  goals: string[]
  age: string
  budget: string
}

export interface PersonalizedResult {
  skinProfile: string
  recommendations: {
    products: string[]
    ingredients: string[]
    routine: string[]
  }
  explanation: string
  tips: string[]
}

export class OpenAIService {
  /**
   * Generera personaliserade hudvårdsresultat baserat på quiz-svar
   */
  static async generateQuizResults(answers: QuizAnswers): Promise<PersonalizedResult> {
    try {
      const prompt = `
Som hudvårdsexpert för 1753 Skincare, analysera dessa quiz-svar och ge personaliserade rekommendationer:

QUIZ-SVAR:
- Hudtyp: ${answers.skinType}
- Hudproblem: ${answers.concerns.join(', ')}
- Livsstil: ${answers.lifestyle.join(', ')}
- Nuvarande produkter: ${answers.currentProducts.join(', ')}
- Mål: ${answers.goals.join(', ')}
- Ålder: ${answers.age}
- Budget: ${answers.budget}

1753 SKINCARE PRODUKTER:
- THE ONE: Allround ansiktsolja med CBD, CBG, MCT-kokosolja
- NATUREL: Ren jojobaolja för känslig hud
- TA-DA: Anti-age serum med CBD och hyaluronsyra
- FUNGTASTIC: Svampextrakt (Chaga, Reishi, Lion's Mane, Cordyceps)
- I LOVE: Kroppsolja med CBD och naturliga oljor
- DUO: Kombinationspaket för komplett hudvård

INGREDIENSER:
- CBD: Anti-inflammatorisk, balanserar oljproduktion
- CBG: Antibakteriell, antioxidant
- MCT-kokosolja: Bärare, antimikrobiell
- Jojobaolja: Efterliknar hudens naturliga sebum
- Chaga: Antioxidant, anti-age
- Reishi: Stressreducerande, lugnande
- Lion's Mane: Cellregenerering
- Cordyceps: Energigivande, cirkulation

Ge svar på svenska i JSON-format:
{
  "skinProfile": "Kort beskrivning av personens hudprofil",
  "recommendations": {
    "products": ["Rekommenderade 1753-produkter"],
    "ingredients": ["Viktiga ingredienser för denna person"],
    "routine": ["Steg-för-steg rutinrekommendationer"]
  },
  "explanation": "Förklaring varför dessa rekommendationer passar",
  "tips": ["3-5 personliga tips för bättre hudvård"]
}
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Du är en expert på hudvård och 1753 Skincare-produkter. Ge alltid personaliserade, vetenskapligt baserade råd på svenska."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const result = completion.choices[0].message.content
      if (!result) {
        throw new Error('Inget svar från OpenAI')
      }

      // Försök att parsa JSON-svaret
      try {
        return JSON.parse(result)
      } catch (parseError) {
        // Fallback om JSON parsing misslyckas
        return {
          skinProfile: "Personlig hudanalys",
          recommendations: {
            products: ["THE ONE"],
            ingredients: ["CBD", "CBG"],
            routine: ["Rengör", "Applicera olja", "Fukta"]
          },
          explanation: result,
          tips: ["Var konsekvent med din rutin", "Lyssna på din hud"]
        }
      }

    } catch (error) {
      console.error('OpenAI API fel:', error)
      throw new Error('Kunde inte generera personaliserade resultat')
    }
  }

  /**
   * Generera produktbeskrivningar med AI
   */
  static async generateProductDescription(productName: string, ingredients: string[]): Promise<string> {
    try {
      const prompt = `
Skriv en engagerande produktbeskrivning för ${productName} från 1753 Skincare.
Ingredienser: ${ingredients.join(', ')}

Fokusera på:
- Naturliga, vetenskapligt baserade fördelar
- Endocannabinoidsystemet i huden
- Hållbarhet och kvalitet
- Svensk design och värderingar

Skriv på svenska, max 150 ord.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Du är en copywriter för 1753 Skincare med fokus på naturlig hudvård och endocannabinoidsystemet."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      })

      return completion.choices[0].message.content || 'Produktbeskrivning kunde inte genereras'

    } catch (error) {
      console.error('OpenAI API fel:', error)
      throw new Error('Kunde inte generera produktbeskrivning')
    }
  }
} 