export interface QuizOption {
  value: string;
  label: string;
  emoji: string;
  description?: string;
  icon?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  description?: string;
  options: QuizOption[];
  icon?: string;
  question?: string;
  subtitle?: string;
}

export const questions: QuizQuestion[] = [
  {
    id: 'skinType',
    text: 'Hur skulle du beskriva din hudtyp?',
    description: 'Att förstå din grundläggande hudtyp hjälper oss ge rätt råd',
    options: [
      {
        value: 'dry',
        label: 'Torr hud',
        emoji: '🏜️',
        description: 'Min hud känns ofta stram och kan fjälla sig'
      },
      {
        value: 'oily',
        label: 'Fet hud',
        emoji: '✨',
        description: 'Min hud är ofta oljig och glansig, särskilt i T-zonen'
      },
      {
        value: 'combination',
        label: 'Kombinationshud',
        emoji: '🎭',
        description: 'Fet i T-zonen men torr på kinderna'
      },
      {
        value: 'sensitive',
        label: 'Känslig hud',
        emoji: '😊',
        description: 'Min hud reagerar lätt på produkter och blir irriterad'
      },
      {
        value: 'normal',
        label: 'Normal hud',
        emoji: '😊',
        description: 'Min hud är generellt balanserad utan större problem'
      }
    ]
  },
  {
    id: 'concerns',
    text: 'Vad är din största hudbekymmer?',
    options: [
      {
        value: 'acne',
        label: 'Akne',
        emoji: '🔴',
        description: 'Finnar, pormaskar eller utbrott'
      },
      {
        value: 'aging',
        label: 'Åldrande',
        emoji: '⏳',
        description: 'Rynkor, fina linjer eller slapp hud'
      },
      {
        value: 'pigmentation',
        label: 'Pigmentering',
        emoji: '🎨',
        description: 'Mörka fläckar eller ojämn hudton'
      },
      {
        value: 'redness',
        label: 'Rodnad',
        emoji: '🌹',
        description: 'Rosacea eller känslig, röd hud'
      },
      {
        value: 'dryness',
        label: 'Torrhet',
        emoji: '🏜️',
        description: 'Stram, fjällig eller uttorkad hud'
      }
    ]
  },
  {
    id: 'routine',
    text: 'Hur ser din nuvarande hudvårdsrutin ut?',
    options: [
      {
        value: 'minimal',
        label: 'Minimal',
        emoji: '1️⃣',
        description: 'Jag använder bara 1-2 produkter'
      },
      {
        value: 'basic',
        label: 'Grundläggande',
        emoji: '2️⃣',
        description: 'Rengöring och återfuktning'
      },
      {
        value: 'moderate',
        label: 'Måttlig',
        emoji: '3️⃣',
        description: '3-5 produkter inklusive serum'
      },
      {
        value: 'extensive',
        label: 'Omfattande',
        emoji: '4️⃣',
        description: 'Fler än 5 produkter dagligen'
      }
    ]
  },
  {
    id: 'sleep',
    text: 'Hur många timmar sover du i genomsnitt per natt?',
    options: [
      {
        value: 'less5',
        label: 'Mindre än 5 timmar',
        emoji: '😴',
        description: 'Jag sover alltför lite'
      },
      {
        value: '5-6',
        label: '5-6 timmar',
        emoji: '😪',
        description: 'Något för lite sömn'
      },
      {
        value: '7-8',
        label: '7-8 timmar',
        emoji: '😊',
        description: 'Lagom med sömn'
      },
      {
        value: 'more8',
        label: 'Mer än 8 timmar',
        emoji: '😌',
        description: 'Jag får gott om sömn'
      }
    ]
  },
  {
    id: 'stress',
    text: 'Hur skulle du beskriva din stressnivå?',
    options: [
      {
        value: 'very_high',
        label: 'Mycket hög',
        emoji: '🌋',
        description: 'Jag känner mig konstant stressad'
      },
      {
        value: 'high',
        label: 'Hög',
        emoji: '😰',
        description: 'Ofta stressad i vardagen'
      },
      {
        value: 'moderate',
        label: 'Måttlig',
        emoji: '😐',
        description: 'Ibland stressad, ibland lugn'
      },
      {
        value: 'low',
        label: 'Låg',
        emoji: '😌',
        description: 'Sällan stressad, oftast lugn'
      }
    ]
  },
  {
    id: 'water',
    text: 'Hur mycket vatten dricker du dagligen?',
    options: [
      {
        value: 'less1L',
        label: 'Mindre än 1 liter',
        emoji: '💧',
        description: 'Jag dricker för lite vatten'
      },
      {
        value: '1-2L',
        label: '1-2 liter',
        emoji: '💦',
        description: 'Okej mängd, men kunde vara mer'
      },
      {
        value: '2-3L',
        label: '2-3 liter',
        emoji: '🌊',
        description: 'Bra mängd vatten dagligen'
      },
      {
        value: 'more3L',
        label: 'Mer än 3 liter',
        emoji: '🏊',
        description: 'Mycket bra hydrering'
      }
    ]
  },
  {
    id: 'diet',
    text: 'Hur skulle du beskriva din kost?',
    options: [
      {
        value: 'very_healthy',
        label: 'Mycket hälsosam',
        emoji: '🥗',
        description: 'Mestadels färsk mat, grönsaker och frukt'
      },
      {
        value: 'healthy',
        label: 'Hälsosam',
        emoji: '🍎',
        description: 'Balanserad kost med ibland onyttigt'
      },
      {
        value: 'average',
        label: 'Varierande',
        emoji: '🍔',
        description: 'Blandat mellan nyttigt och onyttigt'
      },
      {
        value: 'unhealthy',
        label: 'Ohälsosam',
        emoji: '🍟',
        description: 'Mycket processad mat och socker'
      }
    ]
  },
  {
    id: 'exercise',
    text: 'Hur ofta tränar du?',
    options: [
      {
        value: 'daily',
        label: 'Dagligen',
        emoji: '💪',
        description: 'Tränar varje dag'
      },
      {
        value: '3-5week',
        label: '3-5 gånger/vecka',
        emoji: '🏃',
        description: 'Regelbunden träning'
      },
      {
        value: '1-2week',
        label: '1-2 gånger/vecka',
        emoji: '🚶',
        description: 'Tränar ibland'
      },
      {
        value: 'rarely',
        label: 'Sällan',
        emoji: '🛋️',
        description: 'Tränar nästan aldrig'
      }
    ]
  },
  {
    id: 'sunExposure',
    text: 'Hur mycket tid spenderar du i solen?',
    options: [
      {
        value: 'minimal',
        label: 'Minimal',
        emoji: '🏠',
        description: 'Mest inomhus, lite sol'
      },
      {
        value: 'moderate',
        label: 'Måttlig',
        emoji: '⛅',
        description: 'Balanserad inom- och utomhustid'
      },
      {
        value: 'high',
        label: 'Mycket',
        emoji: '☀️',
        description: 'Ofta utomhus i solen'
      },
      {
        value: 'excessive',
        label: 'Väldigt mycket',
        emoji: '🏖️',
        description: 'Arbetar utomhus eller solar ofta'
      }
    ]
  },
  {
    id: 'smoking',
    text: 'Röker du eller exponeras du för cigarettrök?',
    options: [
      {
        value: 'yes_daily',
        label: 'Ja, dagligen',
        emoji: '🚬',
        description: 'Röker eller exponeras dagligen'
      },
      {
        value: 'sometimes',
        label: 'Ibland',
        emoji: '💨',
        description: 'Röker eller exponeras ibland'
      },
      {
        value: 'passive',
        label: 'Passiv rökning',
        emoji: '😤',
        description: 'Exponeras för andras rök'
      },
      {
        value: 'never',
        label: 'Aldrig',
        emoji: '🌿',
        description: 'Röker inte och undviker rök'
      }
    ]
  },
  {
    id: 'alcohol',
    text: 'Hur ofta dricker du alkohol?',
    options: [
      {
        value: 'daily',
        label: 'Dagligen',
        emoji: '🍷',
        description: 'Dricker alkohol varje dag'
      },
      {
        value: 'weekly',
        label: 'Varje vecka',
        emoji: '🍺',
        description: 'Dricker regelbundet varje vecka'
      },
      {
        value: 'monthly',
        label: 'Någon gång i månaden',
        emoji: '🥂',
        description: 'Dricker vid speciella tillfällen'
      },
      {
        value: 'rarely',
        label: 'Sällan eller aldrig',
        emoji: '💧',
        description: 'Dricker nästan aldrig alkohol'
      }
    ]
  },
  {
    id: 'hormones',
    text: 'Upplever du hormonella förändringar?',
    options: [
      {
        value: 'menstrual',
        label: 'Menstruationscykel',
        emoji: '🌙',
        description: 'Regelbundna hormonella förändringar'
      },
      {
        value: 'pregnancy',
        label: 'Graviditet/amning',
        emoji: '🤱',
        description: 'Gravid eller ammar'
      },
      {
        value: 'menopause',
        label: 'Klimakteriet',
        emoji: '🌅',
        description: 'I eller nära klimakteriet'
      },
      {
        value: 'none',
        label: 'Inga märkbara',
        emoji: '⚖️',
        description: 'Inga tydliga hormonella förändringar'
      }
    ]
  },
  {
    id: 'medications',
    text: 'Tar du några mediciner som kan påverka huden?',
    options: [
      {
        value: 'hormonal',
        label: 'Hormonella',
        emoji: '💊',
        description: 'P-piller eller hormonbehandling'
      },
      {
        value: 'antibiotics',
        label: 'Antibiotika',
        emoji: '💉',
        description: 'Tar eller har nyligen tagit antibiotika'
      },
      {
        value: 'other',
        label: 'Andra mediciner',
        emoji: '🏥',
        description: 'Andra mediciner som kan påverka huden'
      },
      {
        value: 'none',
        label: 'Inga mediciner',
        emoji: '🌿',
        description: 'Tar inga mediciner'
      }
    ]
  },
  {
    id: 'age',
    text: 'Vilken åldersgrupp tillhör du?',
    options: [
      {
        value: 'under20',
        label: 'Under 20',
        emoji: '👶'
      },
      {
        value: '20-30',
        label: '20-30',
        emoji: '👨'
      },
      {
        value: '30-40',
        label: '30-40',
        emoji: '👩'
      },
      {
        value: '40-50',
        label: '40-50',
        emoji: '🧑'
      },
      {
        value: 'over50',
        label: 'Över 50',
        emoji: '👵'
      }
    ]
  },
  {
    id: 'environment',
    text: 'I vilken typ av klimat bor du?',
    options: [
      {
        value: 'humid',
        label: 'Fuktigt',
        emoji: '💦',
        description: 'Hög luftfuktighet året runt'
      },
      {
        value: 'dry',
        label: 'Torrt',
        emoji: '🏜️',
        description: 'Låg luftfuktighet, ofta torr luft'
      },
      {
        value: 'mixed',
        label: 'Blandat',
        emoji: '🌤️',
        description: 'Växlar mellan årstider'
      },
      {
        value: 'cold',
        label: 'Kallt',
        emoji: '❄️',
        description: 'Kallt klimat större delen av året'
      },
      {
        value: 'hot',
        label: 'Varmt',
        emoji: '☀️',
        description: 'Varmt och soligt större delen av året'
      }
    ]
  }
];

// Export aliases for backward compatibility
export const quizQuestions = questions;
export type QuizQuestionData = QuizQuestion;