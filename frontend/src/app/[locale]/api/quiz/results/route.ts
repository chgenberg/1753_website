import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, name, email } = body;

    // Mock product recommendations based on skin type
    const productRecommendations: Record<string, string[]> = {
      dry: ['the-serum', 'face-oil', 'body-oil'],
      oily: ['duo-kit', 'face-oil', 'the-serum'],
      combination: ['duo-kit', 'the-serum', 'face-oil'],
      sensitive: ['face-oil', 'body-oil', 'the-cream'],
      normal: ['duo-kit', 'face-oil', 'the-serum']
    };

    const skinType = answers.skinType || 'normal';
    
    // Mock tips based on concerns
    const tips: Record<string, string[]> = {
      acne: [
        'Använd milda, icke-komedogena produkter',
        'Rengör ansiktet två gånger dagligen',
        'Undvik att röra ansiktet ofta'
      ],
      aging: [
        'Använd produkter med antioxidanter',
        'Skydda huden från solen',
        'Håll huden väl återfuktad'
      ],
      pigmentation: [
        'Använd solskydd dagligen',
        'Överväg produkter med C-vitamin',
        'Var tålmodig - resultat tar tid'
      ],
      redness: [
        'Välj lugnande ingredienser',
        'Undvik heta duschar',
        'Använd milda rengöringsprodukter'
      ],
      dryness: [
        'Återfukta morgon och kväll',
        'Drick mycket vatten',
        'Använd en luftfuktare'
      ]
    };

    const skinTypeDescriptions: Record<string, string> = {
      dry: 'Torr hud som behöver intensiv återfuktning',
      oily: 'Fet hud som behöver balansering',
      combination: 'Kombinationshud som behöver anpassad vård',
      sensitive: 'Känslig hud som behöver mild vård',
      normal: 'Normal hud som behöver förebyggande vård'
    };

    // Here you would normally save to database and send email
    // For now, we'll just return mock results
    
    const results = {
      name,
      email,
      skinType: skinTypeDescriptions[skinType],
      recommendedProducts: productRecommendations[skinType] || ['duo-kit', 'face-oil'],
      tips: tips[answers.concerns] || tips.aging,
      answers
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz results' },
      { status: 500 }
    );
  }
} 