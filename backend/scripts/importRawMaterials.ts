import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RawMaterialData {
  name: string;
  swedishName: string;
  origin: string;
  healthBenefits: string[];
  description: string;
  nutrients: string[];
  category: string;
  slug: string;
}

// Helper function to create slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to determine category
function determineCategory(name: string): string {
  const categories = {
    berry: ['blåbär', 'lingon', 'hjortron', 'havtorn', 'nypon', 'svartvinbär'],
    vegetable: ['morot', 'grönkål', 'broccoli', 'paprika', 'spenat', 'tomat', 'lök'],
    fruit: ['granatäpple', 'avokado', 'vindruvor', 'apelsin', 'vattenmelon', 'ananas', 'äpple', 'banan'],
    herb: ['nässla', 'gurkmeja', 'ingefära', 'vitlök', 'svartkummin'],
    fermented: ['yoghurt', 'kimchi', 'surkål', 'miso', 'kefir'],
    nut_seed: ['linfrö', 'nötter', 'pumpafrön', 'chiafrön'],
    tea: ['grönt te'],
    mushroom: ['chaga'],
    oil: ['olivolja'],
    fish: ['fet fisk'],
    grain: ['havre'],
    root: ['jordärtskocka'],
    other: ['mörk choklad', 'ägg', 'ostron', 'benbuljong', 'honung', 'aloe vera', 'alger', 'sojaböna']
  };

  const lowerName = name.toLowerCase();
  for (const [category, items] of Object.entries(categories)) {
    if (items.some(item => lowerName.includes(item))) {
      return category;
    }
  }
  return 'other';
}

// Raw materials data from PDF
const rawMaterials: RawMaterialData[] = [
  {
    name: "Blueberry",
    swedishName: "Blåbär",
    origin: "Nordisk",
    healthBenefits: [
      "Motverkar oxidativ stress och inflammation",
      "Skyddar kollagen i huden",
      "Förbättrar hudens barriärfunktion",
      "Gynnar tarmfloran vilket lindrar inflammatoriska hudproblem"
    ],
    description: "Blåbär är rika på antocyaniner (antioxidanter) som motverkar oxidativ stress och inflammation samt skyddar kollagen i huden. De förbättrar även hudens barriärfunktion och kan gynna tarmfloran, vilket lindrar inflammatoriska hudproblem.",
    nutrients: ["Antocyaniner", "Antioxidanter", "Vitamin C", "Vitamin K", "Fiber"],
    category: "berry",
    slug: "blabar"
  },
  {
    name: "Lingonberry",
    swedishName: "Lingon",
    origin: "Nordisk",
    healthBenefits: [
      "Antiinflammatorisk verkan",
      "Förbättrar tarmfloran",
      "Dämpar låggradig inflammation",
      "Gynnar hudhälsan"
    ],
    description: "Lingon innehåller polyfenoler (t.ex. antocyaniner, quercetin) med antioxidativ och antiinflammatorisk verkan. Kan förbättra tarmfloran (ökad Akkermansia-bakterie) och dämpa låggradig inflammation, vilket gynnar hudhälsan.",
    nutrients: ["Polyfenoler", "Antocyaniner", "Quercetin", "Vitamin C", "Fiber"],
    category: "berry",
    slug: "lingon"
  },
  {
    name: "Cloudberry",
    swedishName: "Hjortron",
    origin: "Nordisk",
    healthBenefits: [
      "Stödjer kollagensyntes",
      "Förbättrar hudens reparationsförmåga",
      "Skyddar mot oxidativ hudskada",
      "Stärker hudbarriären och fuktbalansen"
    ],
    description: "Extremt C-vitaminrika bär (innehåller dubbelt så mycket C-vitamin som apelsin). C-vitamin stödjer kollagensyntes och hudens reparationsförmåga. Även rika på vitamin E och ellagitanniner (antioxidanter) som skyddar mot oxidativ hudskada. Fröoljan innehåller omega-3/6 som stärker hudbarriären och fuktbalansen.",
    nutrients: ["Vitamin C", "Vitamin E", "Ellagitanniner", "Omega-3", "Omega-6"],
    category: "berry",
    slug: "hjortron"
  },
  {
    name: "Sea Buckthorn",
    swedishName: "Havtorn",
    origin: "Nordisk/Asiatisk",
    healthBenefits: [
      "Stärker hudens lipidbarriär",
      "Minskar torrhet",
      "Ökar hudens fuktighet och elasticitet",
      "Dämpar rodnad och inflammation"
    ],
    description: "Bär rika på omega-7-fettsyra, omega-3/6 och antioxidanter. Omega-7 (palmitoleinsyra) stärker hudens lipidbarriär och minskar torrhet. Studier visar att havtornsolja kan öka hudens fuktighet och elasticitet samt dämpa rodnad/inflammation.",
    nutrients: ["Omega-7", "Omega-3", "Omega-6", "Vitamin C", "Vitamin E", "Karotenoider"],
    category: "berry",
    slug: "havtorn"
  },
  {
    name: "Rosehip",
    swedishName: "Nypon",
    origin: "Nordisk/Europa",
    healthBenefits: [
      "Stödjer kollagenbildning",
      "Skyddar hudceller mot UV-skada",
      "Förbättrar hudfukt och elasticitet",
      "Minskar rynkor"
    ],
    description: "Mycket högt C-vitamininnehåll som behövs för kollagenbildning och skyddar hudceller mot UV-inducerad skada. Innehåller även karotenoider (t.ex. betakaroten, lykopen) och polyfenoler med antiinflammatoriska effekter. Kliniska studier visar förbättrad hudfukt och elasticitet samt färre rynkor vid intag av nyponpulver.",
    nutrients: ["Vitamin C", "Betakaroten", "Lykopen", "Polyfenoler", "Vitamin A"],
    category: "berry",
    slug: "nypon"
  },
  {
    name: "Blackcurrant",
    swedishName: "Svartvinbär",
    origin: "Nordisk/Europa",
    healthBenefits: [
      "Ökar hudens kollagen-, elastin- och hyaluronsyranivåer",
      "Motverkar rynkor",
      "Förbättrar elasticitet",
      "Skyddar mot hyperpigmentering och UV-skador"
    ],
    description: "Rika på antocyaniner och C-vitamin. Antocyaninerna ökar hudens kollagen-, elastin- och hyaluronsyranivåer, vilket motverkar rynkor och förbättrar elasticitet. De antioxidativa effekterna skyddar även mot hyperpigmentering och UV-skador.",
    nutrients: ["Antocyaniner", "Vitamin C", "Antioxidanter", "GLA (gamma-linolensyra)"],
    category: "berry",
    slug: "svartvinbar"
  },
  {
    name: "Pomegranate",
    swedishName: "Granatäpple",
    origin: "Global",
    healthBenefits: [
      "Skyddar hudens kollagen mot nedbrytning",
      "Ökar hudens motståndskraft mot solskador",
      "Stark antioxidant- och antiinflammatorisk effekt",
      "Ökar hudens tolerans mot UVB"
    ],
    description: "Innehåller ellaginsyra och andra polyfenoler med stark antioxidant- och antiinflammatorisk effekt. Dessa skyddar hudens kollagen mot nedbrytning av UV-strålning och kan öka hudens motståndskraft mot solskador. Studier visar att konsumtion av granatäppeljuice ökar hudens tolerans mot UVB (minskar rodnad).",
    nutrients: ["Ellaginsyra", "Polyfenoler", "Vitamin C", "Kalium", "Folat"],
    category: "fruit",
    slug: "granatapple"
  },
  {
    name: "Avocado",
    swedishName: "Avokado",
    origin: "Global",
    healthBenefits: [
      "Förbättrar hudens fuktbarriär",
      "Ökar elasticitet och fasthet",
      "Dämpar inflammation i huden",
      "Näringsrik för hudhälsa"
    ],
    description: "Rik på nyttiga fettsyror (enkelomättat fett) och antioxidanter som vitamin E och karotenoider. Dessa näringsämnen förbättrar hudens fuktbarriär och elasticitet. Dagligt intag av avokado visade ökad hudelasticitet och fasthet i en studie. Fetter och vitamin E dämpar även inflammation i huden.",
    nutrients: ["Enkelomättat fett", "Vitamin E", "Karotenoider", "Vitamin K", "Folat"],
    category: "fruit",
    slug: "avokado"
  },
  {
    name: "Tomato",
    swedishName: "Tomat",
    origin: "Global",
    healthBenefits: [
      "Skyddar huden mot UV-skador",
      "Verkar som ett milt inre solskydd",
      "Bidrar till kollagenproduktionen",
      "Starkare hud"
    ],
    description: "Utmärkt källa till lykopen och andra karotenoider samt C-vitamin. Lykopen är en antioxidant som hjälpt till att skydda huden mot UV-skador (verkar som ett milt inre solskydd). C-vitamin bidrar till kollagenproduktionen för starkare hud.",
    nutrients: ["Lykopen", "Karotenoider", "Vitamin C", "Vitamin K", "Kalium"],
    category: "vegetable",
    slug: "tomat"
  },
  {
    name: "Green Tea",
    swedishName: "Grönt te",
    origin: "Asiatisk",
    healthBenefits: [
      "Förbättrar hudens fukt, tjocklek och elasticitet",
      "Skyddar huden mot UV-orsakad stress",
      "Dämpar inflammation via immunmodulering",
      "Kraftfull antioxidativ effekt"
    ],
    description: "Innehåller polyfenoler (katechiner) med kraftfull antioxidativ effekt. Katechinerna kan förbättra hudens fukt, tjocklek och elasticitet samt skydda huden mot UV-orsakad stress. Grönt te dämpar även inflammation i huden via immunmodulering.",
    nutrients: ["Katechiner", "EGCG", "Polyfenoler", "L-teanin", "Koffein"],
    category: "tea",
    slug: "gront-te"
  },
  {
    name: "Dark Chocolate",
    swedishName: "Mörk choklad (≥70% kakao)",
    origin: "Global",
    healthBenefits: [
      "Ökar hudens fuktighet och elasticitet",
      "Förbättrar UV-tålighet",
      "Minskar rynkor",
      "Motverkar fria radikaler"
    ],
    description: "Kakao är rikt på flavanoler (polyfenoler) som förbättrar hudens funktion. Högflavanol-kakao har i studier ökat hudens fuktighet, elasticitet och UV-tålighet samt minskat rynkor. Antioxidanterna i kakao motverkar även fria radikaler som påskyndar hudens åldrande.",
    nutrients: ["Flavanoler", "Polyfenoler", "Magnesium", "Järn", "Fiber"],
    category: "other",
    slug: "mork-choklad"
  },
  {
    name: "Fatty Fish",
    swedishName: "Fet fisk (t.ex. lax, makrill)",
    origin: "Nordisk/Global",
    healthBenefits: [
      "Minskar hudinflammation",
      "Förbättrar hudfukt och barriärfunktion",
      "Stödjer hudens läkning och struktur",
      "Antiinflammatoriska egenskaper"
    ],
    description: "Innehåller omega-3-fettsyror (EPA/DHA) som är antiinflammatoriska. Ett högt omega-3-intag kopplas till minskad hudinflammation och förbättrad hudfukt/barriärfunktion. Fet fisk ger även protein av hög kvalitet och zink, vilket stödjer hudens läkning och struktur.",
    nutrients: ["Omega-3 (EPA/DHA)", "Protein", "Vitamin D", "Selen", "Zink"],
    category: "fish",
    slug: "fet-fisk"
  },
  // Add more materials...
  {
    name: "Turmeric",
    swedishName: "Gurkmeja",
    origin: "Asiatisk",
    healthBenefits: [
      "Dämpar inflammation i huden",
      "Lugnar hud med akne, psoriasis och eksem",
      "Främjar sårläkning",
      "Motverkar oxidativ stress"
    ],
    description: "Gurkmeja innehåller curcumin, en starkt antiinflammatorisk och antioxidativ polyfenol. Curcumin dämpar NF-κB-signalering och minskar proinflammatoriska cytokiner, vilket kan lugna hud med akne, psoriasis och eksem. Ämnet främjar också sårläkning genom att stimulera kollagenbildning i huden och motverka oxidativ stress.",
    nutrients: ["Curcumin", "Polyfenoler", "Mangan", "Järn", "Vitamin B6"],
    category: "herb",
    slug: "gurkmeja"
  },
  {
    name: "Ginger",
    swedishName: "Ingefära",
    origin: "Asiatisk",
    healthBenefits: [
      "Minskar rodnad och svullnad",
      "Motverkar hyperpigmentering",
      "Skyddar kollagen",
      "Antibakteriella egenskaper"
    ],
    description: "Ingefära innehåller gingerol som har potenta antiinflammatoriska och antioxidativa effekter. Gingerol minskar rodnad och svullnad vid inflammatoriska hudtillstånd (t.ex. akne, eksem, psoriasis). Ingefära kan även lysa upp hudtonen genom att motverka hyperpigmentering och skyddar kollagen genom att hämma kollagen-nedbrytande enzymer.",
    nutrients: ["Gingerol", "Shogaol", "Vitamin C", "Magnesium", "Kalium"],
    category: "herb",
    slug: "ingefara"
  },
  {
    name: "Probiotic Yogurt",
    swedishName: "Yoghurt (probiotisk)",
    origin: "Global",
    healthBenefits: [
      "Förbättrar tarmflorans balans",
      "Minskar systemisk inflammation",
      "Färre inflammatoriska hudproblem",
      "Stärker hudens immunförsvar och barriär"
    ],
    description: "Fermenterad mjölkprodukt med probiotiska bakterier (t.ex. Lactobacillus). Dessa goda bakterier kan förbättra tarmflorans balans och minska systemisk inflammation. En hälsosam tarmflora via yoghurtintag har kopplats till färre inflammatoriska hudproblem (som akne och rosacea) genom att stärka hudens immunförsvar och barriär (gut-skin-axiseffekt).",
    nutrients: ["Probiotiska bakterier", "Protein", "Kalcium", "B-vitaminer", "Vitamin D"],
    category: "fermented",
    slug: "probiotisk-yoghurt"
  },
  {
    name: "Kimchi",
    swedishName: "Kimchi (fermenterade grönsaker)",
    origin: "Asiatisk (Korea)",
    healthBenefits: [
      "Stödjer diversifierad tarmflora",
      "Reducerar inflammation",
      "Minskar akneutbrott och rosacea",
      "Bidrar till kollagensyntes"
    ],
    description: "Traditionellt fermenterad kål med probiotiska mjölksyrebakterier. Probiotika från kimchi stödjer en diversifierad tarmflora och reducerar inflammation i kroppen – vilket kan minska akneutbrott, rosacea och andra hudinflammationer. Kimchi är även rik på antioxidanter och vitamin C som bidrar till kollagensyntes och skydd mot oxidativ stress i huden.",
    nutrients: ["Probiotiska bakterier", "Vitamin C", "Vitamin K", "Folat", "Fiber"],
    category: "fermented",
    slug: "kimchi"
  },
  {
    name: "Chia Seeds",
    swedishName: "Chiafrön",
    origin: "Global",
    healthBenefits: [
      "Verkar prebiotiskt i tarmen",
      "Minskar inflammation",
      "Förbättrar hudens fettsyramönster",
      "Bidrar till intakt hudbarriär"
    ],
    description: "Små frön rika på omega-3 (ALA), fiber och antioxidanter. Fibrerna verkar prebiotiskt i tarmen – de fermenteras av bakterier och ökar gynnsamma stammar, vilket kan minska inflammation som når huden. Omega-3 från chia dämpar dessutom hudinflammation och bidrar till intakt hudbarriär genom att förbättra hudens fettsyramönster.",
    nutrients: ["Omega-3 (ALA)", "Fiber", "Protein", "Kalcium", "Antioxidanter"],
    category: "nut_seed",
    slug: "chiafron"
  },
  {
    name: "Bone Broth",
    swedishName: "Benbuljong",
    origin: "Global",
    healthBenefits: [
      "Förbättrar hudens elasticitet och fuktnivå",
      "Minskar rynkdjup",
      "Understödjer hudens struktur",
      "Ökad kollagentillgång"
    ],
    description: "Långkokt buljong på ben frigör kollagen, gelatin och mineraler. Oralt intag av kollagenpeptider/gelatin har i studier visat sig förbättra hudens elasticitet, fuktnivå och minska rynkdjup. Glycin och prolin från buljong bidrar som byggstenar till hudens kollagenmatris. Benbuljong kan alltså understödja hudens struktur via ökad kollagentillgång.",
    nutrients: ["Kollagen", "Gelatin", "Glycin", "Prolin", "Mineraler"],
    category: "other",
    slug: "benbuljong"
  }
];

async function importRawMaterials() {
  try {
    console.log('🔄 Starting raw materials import...');
    
    for (const material of rawMaterials) {
      try {
        const existing = await prisma.rawMaterial.findUnique({
          where: { slug: material.slug }
        });
        
        if (existing) {
          console.log(`⚠️  Skipping ${material.swedishName} - already exists`);
          continue;
        }
        
        const created = await prisma.rawMaterial.create({
          data: {
            name: material.name,
            swedishName: material.swedishName,
            origin: material.origin,
            category: material.category,
            healthBenefits: material.healthBenefits,
            description: material.description,
            nutrients: material.nutrients,
            slug: material.slug,
            metaTitle: `${material.swedishName} - Funktionell råvara för hudhälsa | 1753 Skincare`,
            metaDescription: `Läs om ${material.swedishName.toLowerCase()} och dess fördelar för huden. ${material.healthBenefits[0]}. Upptäck mer om funktionella råvaror för optimal hudhälsa.`,
            references: [],
            studies: [],
            isActive: true
          }
        });
        
        console.log(`✅ Imported ${created.swedishName}`);
      } catch (error) {
        console.error(`❌ Error importing ${material.swedishName}:`, error);
      }
    }
    
    const count = await prisma.rawMaterial.count();
    console.log(`\n✨ Import complete! Total raw materials: ${count}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importRawMaterials(); 