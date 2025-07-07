export interface QuizOption {
  label: string
  description: string
  value: string
  icon: string
}

export interface QuizQuestionData {
  id: number
  question: string
  subtitle: string
  icon: string
  options: QuizOption[]
}

export const quizQuestions: QuizQuestionData[] = [
  {
    id: 1,
    question: "Hur skulle du beskriva din hudtyp?",
    subtitle: "Att förstå din grundläggande hudtyp hjälper oss ge rätt råd",
    icon: "🧴",
    options: [
      {
        label: "Torr hud",
        description: "Min hud känns ofta stram och kan fjälla sig",
        value: "dry_skin",
        icon: "🏜️"
      },
      {
        label: "Fet hud",
        description: "Min hud är ofta oljig och glansig, särskilt i T-zonen",
        value: "oily_skin",
        icon: "✨"
      },
      {
        label: "Kombinationshud",
        description: "Fet i T-zonen men torr på kinderna",
        value: "combination_skin",
        icon: "🎭"
      },
      {
        label: "Känslig hud",
        description: "Min hud reagerar lätt på produkter och blir irriterad",
        value: "sensitive_skin",
        icon: "😳"
      },
      {
        label: "Normal hud",
        description: "Min hud är generellt balanserad utan större problem",
        value: "normal_skin",
        icon: "😌"
      }
    ]
  },
  {
    id: 2,
    question: "Vilka hudproblem upplever du mest?",
    subtitle: "Identifiera dina huvudsakliga hudbekymmer",
    icon: "🔍",
    options: [
      {
        label: "Akne och finnar",
        description: "Jag har regelbundna utbrott av finnar och pormaskar",
        value: "acne_breakouts",
        icon: "🎯"
      },
      {
        label: "Rynkor och åldrande",
        description: "Jag ser tecken på åldrande som rynkor och förlust av fasthet",
        value: "aging_wrinkles",
        icon: "⏰"
      },
      {
        label: "Pigmentfläckar och ojämn hudton",
        description: "Jag har mörka fläckar och ojämn hudton",
        value: "pigmentation_uneven",
        icon: "🌈"
      },
      {
        label: "Eksem eller utslag",
        description: "Jag har ofta rödhet, klåda eller inflammationer",
        value: "eczema_rash",
        icon: "🔥"
      },
      {
        label: "Stora porer och ojämn hudstruktur",
        description: "Mina porer är synliga och huden känns ojämn",
        value: "large_pores",
        icon: "🕳️"
      }
    ]
  },
  {
    id: 3,
    question: "Hur ofta vårdar du ditt ansikte?",
    subtitle: "Din nuvarande hudvårdsrutin påverkar hudkvaliteten",
    icon: "🧼",
    options: [
      {
        label: "Omfattande rutin (morgon och kväll)",
        description: "Jag har en detaljerad rutin med flera steg",
        value: "comprehensive_routine",
        icon: "✨"
      },
      {
        label: "Grundläggande rutin (tvätta och fukta)",
        description: "Jag tvättar ansiktet och använder fuktcreme",
        value: "basic_routine",
        icon: "🧴"
      },
      {
        label: "Minimal rutin (bara tvättar ansiktet)",
        description: "Jag tvättar ansiktet med vanlig tvål ibland",
        value: "minimal_routine",
        icon: "💧"
      },
      {
        label: "Ingen rutin",
        description: "Jag gör ingenting speciellt för min hud",
        value: "no_routine",
        icon: "🤷"
      }
    ]
  },
  {
    id: 4,
    question: "Hur påverkar stress din hud?",
    subtitle: "Stress har stor inverkan på hudkvaliteten",
    icon: "😰",
    options: [
      {
        label: "Stora utbrott vid stress",
        description: "Min hud blir betydligt sämre när jag är stressad",
        value: "major_stress_impact",
        icon: "🌋"
      },
      {
        label: "Märkbar försämring vid stress",
        description: "Jag ser tydliga förändringar i huden vid stress",
        value: "noticeable_stress_impact",
        icon: "📈"
      },
      {
        label: "Minimal påverkan av stress",
        description: "Stress påverkar min hud lite grann",
        value: "minimal_stress_impact",
        icon: "🌊"
      },
      {
        label: "Ingen påverkan av stress",
        description: "Jag märker ingen skillnad i huden vid stress",
        value: "no_stress_impact",
        icon: "🧘"
      }
    ]
  },
  {
    id: 5,
    question: "Hur mycket sömn får du per natt?",
    subtitle: "Sömn är avgörande för hudens återhämtning och förnyelse",
    icon: "🌙",
    options: [
      {
        label: "7-9 timmar kvalitetssömn",
        description: "Jag sover tillräckligt och vaknar utvilad",
        value: "good_sleep",
        icon: "😴"
      },
      {
        label: "6-7 timmar, okej kvalitet",
        description: "Jag sover ganska bra men kunde sova mer",
        value: "moderate_sleep",
        icon: "😊"
      },
      {
        label: "5-6 timmar, oregelbunden sömn",
        description: "Jag sover för lite och har oregelbundna tider",
        value: "poor_sleep",
        icon: "😵"
      },
      {
        label: "Mindre än 5 timmar, dålig kvalitet",
        description: "Jag sover för lite och vaknar ofta under natten",
        value: "very_poor_sleep",
        icon: "🥱"
      }
    ]
  },
  {
    id: 6,
    question: "Hur mycket vatten dricker du dagligen?",
    subtitle: "Hydratisering påverkar hudens elasticitet och utseende",
    icon: "💧",
    options: [
      {
        label: "2-3 liter om dagen",
        description: "Jag dricker mycket vatten och är väl hydrerad",
        value: "well_hydrated",
        icon: "🌊"
      },
      {
        label: "1-2 liter om dagen",
        description: "Jag dricker en del vatten men kunde dricka mer",
        value: "moderately_hydrated",
        icon: "💧"
      },
      {
        label: "Mindre än 1 liter",
        description: "Jag dricker lite vatten, mest kaffe och andra drycker",
        value: "dehydrated",
        icon: "🏜️"
      },
      {
        label: "Glömmer ofta att dricka vatten",
        description: "Jag tänker sällan på att dricka vatten",
        value: "very_dehydrated",
        icon: "🥵"
      }
    ]
  },
  {
    id: 7,
    question: "Hur är dina matvanor för hudhälsa?",
    subtitle: "Kosten påverkar huden inifrån och ut",
    icon: "🥗",
    options: [
      {
        label: "Hälsosam kost med mycket antioxidanter",
        description: "Jag äter mycket grönsaker, frukt och näring som gynnar huden",
        value: "skin_healthy_diet",
        icon: "🌱"
      },
      {
        label: "Blandat - ibland hälsosamt",
        description: "Jag försöker äta hälsosamt men lyckas inte alltid",
        value: "mixed_diet",
        icon: "🥙"
      },
      {
        label: "Mycket socker och processad mat",
        description: "Jag äter ofta godis, snabbmat och processed food",
        value: "inflammatory_diet",
        icon: "🍟"
      },
      {
        label: "Osäker på vad som är bra för huden",
        description: "Jag vet inte vilka livsmedel som påverkar min hud",
        value: "unsure_diet",
        icon: "🤔"
      }
    ]
  },
  {
    id: 8,
    question: "Hur mycket är du i solen?",
    subtitle: "Solexponering påverkar hudens åldrande och hälsa",
    icon: "☀️",
    options: [
      {
        label: "Mycket sol, använder alltid solskydd",
        description: "Jag är ofta utomhus men skyddar alltid min hud",
        value: "sun_protected",
        icon: "🧴"
      },
      {
        label: "Måttligt med sol, ibland solskydd",
        description: "Jag är utomhus ibland och använder solskydd när jag tänker på det",
        value: "moderate_sun",
        icon: "🌤️"
      },
      {
        label: "Mycket sol, sällan solskydd",
        description: "Jag är ofta i solen men använder sällan solskydd",
        value: "sun_exposed",
        icon: "🏖️"
      },
      {
        label: "Lite sol, inomhus mest",
        description: "Jag är mest inomhus och får lite naturligt ljus",
        value: "limited_sun",
        icon: "🏠"
      }
    ]
  },
  {
    id: 9,
    question: "Hur ofta tränar du?",
    subtitle: "Motion förbättrar cirkulationen och hudens utseende",
    icon: "🏃‍♀️",
    options: [
      {
        label: "5+ gånger per vecka",
        description: "Jag tränar regelbundet och svettas bra",
        value: "very_active",
        icon: "💪"
      },
      {
        label: "3-4 gånger per vecka",
        description: "Jag tränar regelbundet några gånger i veckan",
        value: "active",
        icon: "🏋️"
      },
      {
        label: "1-2 gånger per vecka",
        description: "Jag rör på mig ibland men inte så ofta",
        value: "somewhat_active",
        icon: "🚶"
      },
      {
        label: "Sällan eller aldrig",
        description: "Jag tränar inte särskilt ofta",
        value: "sedentary",
        icon: "🛋️"
      }
    ]
  },
  {
    id: 10,
    question: "Hur påverkar hormoner din hud?",
    subtitle: "Hormonella förändringar kan starkt påverka hudtillståndet",
    icon: "🔄",
    options: [
      {
        label: "Stora förändringar under menstruationen",
        description: "Min hud förändras dramatiskt under menscykeln",
        value: "major_hormonal_changes",
        icon: "🌊"
      },
      {
        label: "Märkbara förändringar under menstruationen",
        description: "Jag ser tydliga förändringar i huden under vissa perioder",
        value: "noticeable_hormonal_changes",
        icon: "📅"
      },
      {
        label: "Små förändringar eller osäker",
        description: "Jag märker minimal påverkan eller är osäker",
        value: "minimal_hormonal_changes",
        icon: "🤷"
      },
      {
        label: "Genomgår menopaus/hormonförändringar",
        description: "Jag är i menopaus eller har andra hormonella förändringar",
        value: "menopausal_changes",
        icon: "🔥"
      }
    ]
  },
  {
    id: 11,
    question: "Vilken åldersgrupp tillhör du?",
    subtitle: "Hudens behov förändras med åldern",
    icon: "🎂",
    options: [
      {
        label: "Under 25 år",
        description: "Jag är ung och vill förebygga hudproblem",
        value: "young_adult",
        icon: "🌟"
      },
      {
        label: "25-35 år",
        description: "Jag börjar tänka på anti-aging och förebyggande vård",
        value: "young_professional",
        icon: "💼"
      },
      {
        label: "35-45 år",
        description: "Jag ser första tecknen på åldrande och vill motverka det",
        value: "middle_aged",
        icon: "🎯"
      },
      {
        label: "45+ år",
        description: "Jag vill bekämpa åldrande och bevara hudkvaliteten",
        value: "mature_adult",
        icon: "👑"
      }
    ]
  },
  {
    id: 12,
    question: "Vad är ditt främsta hudmål?",
    subtitle: "Vad vill du uppnå med förbättrad hudvård?",
    icon: "🎯",
    options: [
      {
        label: "Få bukt med akne och finnar",
        description: "Jag vill ha en ren, problemfri hud",
        value: "clear_skin",
        icon: "✨"
      },
      {
        label: "Minska åldrande och rynkor",
        description: "Jag vill bevara ungdomlig, fast hud",
        value: "anti_aging",
        icon: "⏰"
      },
      {
        label: "Förbättra hudton och lyster",
        description: "Jag vill ha en jämn, strålande hud",
        value: "radiant_skin",
        icon: "🌟"
      },
      {
        label: "Lugna känslig/irriterad hud",
        description: "Jag vill ha mindre rodnad och irritation",
        value: "calm_skin",
        icon: "🌿"
      },
      {
        label: "Allmän hudförbättring",
        description: "Jag vill förbättra hela min hudkvalitet",
        value: "overall_improvement",
        icon: "🚀"
      }
    ]
  }
] 