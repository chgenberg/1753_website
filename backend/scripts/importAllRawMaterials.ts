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
    berry: ['blåbär', 'lingon', 'hjortron', 'havtorn', 'nypon', 'svartvinbär', 'vindruvor', 'vattenmelon'],
    vegetable: ['morot', 'grönkål', 'broccoli', 'paprika', 'spenat', 'tomat', 'lök', 'nässla'],
    fruit: ['granatäpple', 'avokado', 'apelsin', 'ananas', 'äpple', 'banan'],
    herb: ['gurkmeja', 'ingefära', 'vitlök', 'svartkummin'],
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

// Complete list of all raw materials from PDF
const allRawMaterials: RawMaterialData[] = [
  {
    name: "Blueberry",
    swedishName: "Blåbär",
    origin: "Nordisk",
    healthBenefits: ["Motverkar oxidativ stress och inflammation", "Skyddar kollagen", "Förbättrar hudbarriär", "Gynnar tarmfloran"],
    description: "Rika på antocyaniner (antioxidanter) som motverkar oxidativ stress och inflammation samt skyddar kollagen i huden. Förbättrar även hudens barriärfunktion och kan gynna tarmfloran, vilket lindrar inflammatoriska hudproblem.",
    nutrients: ["Antocyaniner", "Antioxidanter", "Vitamin C", "Vitamin K", "Fiber"],
    category: "berry",
    slug: "blabar"
  },
  {
    name: "Lingonberry",
    swedishName: "Lingon",
    origin: "Nordisk",
    healthBenefits: ["Antiinflammatorisk verkan", "Förbättrar tarmfloran", "Dämpar låggradig inflammation", "Gynnar hudhälsan"],
    description: "Innehåller polyfenoler (t.ex. antocyaniner, quercetin) med antioxidativ och antiinflammatorisk verkan. Kan förbättra tarmfloran (ökad Akkermansia-bakterie) och dämpa låggradig inflammation, vilket gynnar hudhälsan.",
    nutrients: ["Polyfenoler", "Antocyaniner", "Quercetin", "Vitamin C", "Fiber"],
    category: "berry",
    slug: "lingon"
  },
  {
    name: "Cloudberry",
    swedishName: "Hjortron",
    origin: "Nordisk",
    healthBenefits: ["Stödjer kollagensyntes", "Förbättrar hudens reparationsförmåga", "Skyddar mot oxidativ hudskada", "Stärker hudbarriären"],
    description: "Extremt C-vitaminrika bär (innehåller dubbelt så mycket C-vitamin som apelsin). C-vitamin stödjer kollagensyntes och hudens reparationsförmåga. Även rika på vitamin E och ellagitanniner som skyddar mot oxidativ hudskada.",
    nutrients: ["Vitamin C", "Vitamin E", "Ellagitanniner", "Omega-3", "Omega-6"],
    category: "berry",
    slug: "hjortron"
  },
  {
    name: "Sea Buckthorn",
    swedishName: "Havtorn",
    origin: "Nordisk/Asiatisk",
    healthBenefits: ["Stärker hudens lipidbarriär", "Minskar torrhet", "Ökar fuktighet och elasticitet", "Dämpar inflammation"],
    description: "Bär rika på omega-7-fettsyra, omega-3/6 och antioxidanter. Omega-7 (palmitoleinsyra) stärker hudens lipidbarriär och minskar torrhet. Studier visar att havtornsolja kan öka hudens fuktighet och elasticitet samt dämpa rodnad/inflammation.",
    nutrients: ["Omega-7", "Omega-3", "Omega-6", "Vitamin C", "Vitamin E", "Karotenoider"],
    category: "berry",
    slug: "havtorn"
  },
  {
    name: "Rosehip",
    swedishName: "Nypon",
    origin: "Nordisk/Europa",
    healthBenefits: ["Stödjer kollagenbildning", "Skyddar mot UV-skada", "Förbättrar hudfukt och elasticitet", "Minskar rynkor"],
    description: "Mycket högt C-vitamininnehåll som behövs för kollagenbildning och skyddar hudceller mot UV-inducerad skada. Innehåller även karotenoider och polyfenoler med antiinflammatoriska effekter.",
    nutrients: ["Vitamin C", "Betakaroten", "Lykopen", "Polyfenoler", "Vitamin A"],
    category: "berry",
    slug: "nypon"
  },
  {
    name: "Blackcurrant",
    swedishName: "Svartvinbär",
    origin: "Nordisk/Europa",
    healthBenefits: ["Ökar kollagen-, elastin- och hyaluronsyranivåer", "Motverkar rynkor", "Förbättrar elasticitet", "Skyddar mot UV-skador"],
    description: "Rika på antocyaniner och C-vitamin. Antocyaninerna ökar hudens kollagen-, elastin- och hyaluronsyranivåer, vilket motverkar rynkor och förbättrar elasticitet.",
    nutrients: ["Antocyaniner", "Vitamin C", "Antioxidanter", "GLA"],
    category: "berry",
    slug: "svartvinbar"
  },
  {
    name: "Pomegranate",
    swedishName: "Granatäpple",
    origin: "Global",
    healthBenefits: ["Skyddar kollagen mot nedbrytning", "Ökar motståndskraft mot solskador", "Stark antioxidanteffekt", "Ökar UV-tolerans"],
    description: "Innehåller ellaginsyra och andra polyfenoler med stark antioxidant- och antiinflammatorisk effekt. Dessa skyddar hudens kollagen mot nedbrytning av UV-strålning.",
    nutrients: ["Ellaginsyra", "Polyfenoler", "Vitamin C", "Kalium", "Folat"],
    category: "fruit",
    slug: "granatapple"
  },
  {
    name: "Avocado",
    swedishName: "Avokado",
    origin: "Global",
    healthBenefits: ["Förbättrar fuktbarriär", "Ökar elasticitet och fasthet", "Dämpar inflammation", "Näringsrik för huden"],
    description: "Rik på nyttiga fettsyror (enkelomättat fett) och antioxidanter som vitamin E och karotenoider. Dagligt intag av avokado visade ökad hudelasticitet och fasthet i studier.",
    nutrients: ["Enkelomättat fett", "Vitamin E", "Karotenoider", "Vitamin K", "Folat"],
    category: "fruit",
    slug: "avokado"
  },
  {
    name: "Tomato",
    swedishName: "Tomat",
    origin: "Global",
    healthBenefits: ["Skyddar mot UV-skador", "Verkar som inre solskydd", "Bidrar till kollagenproduktion", "Stärker huden"],
    description: "Utmärkt källa till lykopen och andra karotenoider samt C-vitamin. Lykopen är en antioxidant som hjälper skydda huden mot UV-skador (verkar som ett milt inre solskydd).",
    nutrients: ["Lykopen", "Karotenoider", "Vitamin C", "Vitamin K", "Kalium"],
    category: "vegetable",
    slug: "tomat"
  },
  {
    name: "Green Tea",
    swedishName: "Grönt te",
    origin: "Asiatisk",
    healthBenefits: ["Förbättrar fukt, tjocklek och elasticitet", "Skyddar mot UV-stress", "Dämpar inflammation", "Kraftfull antioxidanteffekt"],
    description: "Innehåller polyfenoler (katechiner) med kraftfull antioxidativ effekt. Katechinerna kan förbättra hudens fukt, tjocklek och elasticitet samt skydda huden mot UV-orsakad stress.",
    nutrients: ["Katechiner", "EGCG", "Polyfenoler", "L-teanin", "Koffein"],
    category: "tea",
    slug: "gront-te"
  },
  {
    name: "Dark Chocolate",
    swedishName: "Mörk choklad (≥70% kakao)",
    origin: "Global",
    healthBenefits: ["Ökar fuktighet och elasticitet", "Förbättrar UV-tålighet", "Minskar rynkor", "Motverkar fria radikaler"],
    description: "Kakao är rikt på flavanoler (polyfenoler) som förbättrar hudens funktion. Högflavanol-kakao har ökat hudens fuktighet, elasticitet och UV-tålighet samt minskat rynkor.",
    nutrients: ["Flavanoler", "Polyfenoler", "Magnesium", "Järn", "Fiber"],
    category: "other",
    slug: "mork-choklad"
  },
  {
    name: "Fatty Fish",
    swedishName: "Fet fisk (t.ex. lax, makrill)",
    origin: "Nordisk/Global",
    healthBenefits: ["Minskar hudinflammation", "Förbättrar fukt och barriärfunktion", "Stödjer läkning och struktur", "Antiinflammatorisk"],
    description: "Innehåller omega-3-fettsyror (EPA/DHA) som är antiinflammatoriska. Högt omega-3-intag kopplas till minskad hudinflammation och förbättrad hudfukt/barriärfunktion.",
    nutrients: ["Omega-3 (EPA/DHA)", "Protein", "Vitamin D", "Selen", "Zink"],
    category: "fish",
    slug: "fet-fisk"
  },
  {
    name: "Flaxseed",
    swedishName: "Linfrö",
    origin: "Nordisk/Europa",
    healthBenefits: ["Förbättrar hudsmidighet och fukt", "Minskar hudirritation", "Dämpar inflammation", "Prebiotisk effekt"],
    description: "Rikt på omega-3 (ALA) samt lignaner och fiber. Dagligt tillskott av linfröolja har visat förbättrad hudsmidighet och fukt samt minskad hudirritation.",
    nutrients: ["Omega-3 (ALA)", "Lignaner", "Fiber", "Protein", "Magnesium"],
    category: "nut_seed",
    slug: "linfro"
  },
  {
    name: "Olive Oil",
    swedishName: "Olivolja (extra jungfru)",
    origin: "Medelhavsk",
    healthBenefits: ["Minskar kronisk inflammation", "Lindrar psoriasis och akne", "Stödjer hudbarriär", "Antiinflammatorisk"],
    description: "Innehåller mest enkelomättade fetter (oleinsyra) samt polyfenoler. Hög konsumtion av olivolja har kopplats till lindrigare psoriasis och akne tack vare antiinflammatoriska effekten.",
    nutrients: ["Oleinsyra", "Polyfenoler", "Vitamin E", "Vitamin K", "Antioxidanter"],
    category: "oil",
    slug: "olivolja"
  },
  {
    name: "Nuts",
    swedishName: "Nötter (t.ex. mandel, valnöt)",
    origin: "Global",
    healthBenefits: ["Skyddar hudceller mot skador", "Dämpar inflammation", "Förbättrar hudbarriär", "Bättre sårläkning"],
    description: "Nötter är rika på vitamin E, hälsosamma fetter och mineraler. Vitamin E i mandel skyddar hudceller mot skador. Valnötter innehåller omega-3 som dämpar inflammation.",
    nutrients: ["Vitamin E", "Omega-3", "Zink", "Magnesium", "Protein"],
    category: "nut_seed",
    slug: "notter"
  },
  {
    name: "Pumpkin Seeds",
    swedishName: "Pumpafrön",
    origin: "Global",
    healthBenefits: ["Skyddar mot oxidativ hudskada", "Viktigt för sårläkning", "Stärker immunförsvar", "Främjar läkning vid akne"],
    description: "Frön rika på mineraler och antioxidanter – särskilt vitamin E och zink. Vitamin E skyddar mot oxidativ hudskada, och zink är viktigt för sårläkning och hudens immunförsvar.",
    nutrients: ["Vitamin E", "Zink", "Magnesium", "Järn", "Protein"],
    category: "nut_seed",
    slug: "pumpafron"
  },
  {
    name: "Carrot",
    swedishName: "Morot",
    origin: "Global",
    healthBenefits: ["Förbättrar hudens förnyelse", "Naturligt solskydd", "Ökar UV-motstånd", "Motverkar solskador"],
    description: "Innehåller betakaroten som omvandlas till vitamin A, viktigt för hudens förnyelse och barriärfunktion. Högt intag av betakaroten ger ett visst naturligt solskydd.",
    nutrients: ["Betakaroten", "Vitamin A", "Fiber", "Kalium", "Antioxidanter"],
    category: "vegetable",
    slug: "morot"
  },
  {
    name: "Kale",
    swedishName: "Grönkål",
    origin: "Nordisk",
    healthBenefits: ["Skyddar mot UV-skada", "Bidrar till kollagenbildning", "Förbättrar elasticitet", "Friskare hudton"],
    description: "Näringsspäckad bladgrönsak rik på betakaroten, lutein och vitamin C. Betakaroten och lutein skyddar huden mot UV-inducerad skada. C-vitamin bidrar till kollagenbildning.",
    nutrients: ["Betakaroten", "Lutein", "Vitamin C", "Vitamin K", "Folat"],
    category: "vegetable",
    slug: "gronkal"
  },
  {
    name: "Nettle",
    swedishName: "Nässla (brännässla)",
    origin: "Nordisk",
    healthBenefits: ["Antiinflammatorisk", "Antihistamin", "Lindrar eksem och utslag", "Skyddar hudceller"],
    description: "Vild ört rik på vitamin A, magnesium, kalcium. Har kraftiga antiinflammatoriska och antihistamina egenskaper; traditionellt använd mot eksem och allergiska hudutslag.",
    nutrients: ["Vitamin A", "Magnesium", "Kalcium", "Järn", "Protein"],
    category: "herb",
    slug: "nassla"
  },
  {
    name: "Turmeric",
    swedishName: "Gurkmeja",
    origin: "Asiatisk",
    healthBenefits: ["Dämpar inflammation", "Lugnar akne, psoriasis och eksem", "Främjar sårläkning", "Motverkar oxidativ stress"],
    description: "Gurkmeja innehåller curcumin, en starkt antiinflammatorisk och antioxidativ polyfenol. Curcumin dämpar proinflammatoriska cytokiner och främjar sårläkning genom kollagenstimulering.",
    nutrients: ["Curcumin", "Polyfenoler", "Mangan", "Järn", "Vitamin B6"],
    category: "herb",
    slug: "gurkmeja"
  },
  {
    name: "Ginger",
    swedishName: "Ingefära",
    origin: "Asiatisk",
    healthBenefits: ["Minskar rodnad och svullnad", "Motverkar hyperpigmentering", "Skyddar kollagen", "Antibakteriell"],
    description: "Ingefära innehåller gingerol med potenta antiinflammatoriska och antioxidativa effekter. Kan lysa upp hudtonen och skydda kollagen genom att hämma nedbrytande enzymer.",
    nutrients: ["Gingerol", "Shogaol", "Vitamin C", "Magnesium", "Kalium"],
    category: "herb",
    slug: "ingefara"
  },
  {
    name: "Garlic",
    swedishName: "Vitlök",
    origin: "Global",
    healthBenefits: ["Antibakteriell", "Antifungal", "Bekämpar aknebakterier", "Dämpar inflammation"],
    description: "Innehåller svavelföreningen allicin med antibakteriell, antifungal och antiinflammatorisk effekt. Vitlök kan hjälpa bekämpa akneframkallande bakterier och dämpa inflammation.",
    nutrients: ["Allicin", "Svavelföreningar", "Vitamin C", "Vitamin B6", "Mangan"],
    category: "herb",
    slug: "vitlok"
  },
  {
    name: "Probiotic Yogurt",
    swedishName: "Yoghurt (probiotisk)",
    origin: "Global",
    healthBenefits: ["Förbättrar tarmflorans balans", "Minskar systemisk inflammation", "Färre inflammatoriska hudproblem", "Stärker immunförsvar"],
    description: "Fermenterad mjölkprodukt med probiotiska bakterier (t.ex. Lactobacillus). En hälsosam tarmflora via yoghurtintag har kopplats till färre inflammatoriska hudproblem genom gut-skin-axiseffekt.",
    nutrients: ["Probiotiska bakterier", "Protein", "Kalcium", "B-vitaminer", "Vitamin D"],
    category: "fermented",
    slug: "probiotisk-yoghurt"
  },
  {
    name: "Kimchi",
    swedishName: "Kimchi (fermenterade grönsaker)",
    origin: "Asiatisk (Korea)",
    healthBenefits: ["Stödjer diversifierad tarmflora", "Reducerar inflammation", "Minskar akneutbrott", "Bidrar till kollagensyntes"],
    description: "Traditionellt fermenterad kål med probiotiska mjölksyrebakterier. Probiotika från kimchi stödjer tarmflora och reducerar inflammation, vilket kan minska hudproblem.",
    nutrients: ["Probiotiska bakterier", "Vitamin C", "Vitamin K", "Folat", "Fiber"],
    category: "fermented",
    slug: "kimchi"
  },
  {
    name: "Sauerkraut",
    swedishName: "Surkål (fermenterad kål)",
    origin: "Europeisk (Nordisk/Tysk)",
    healthBenefits: ["Ökar tarmflorans mångfald", "Stärker tarmbarriären", "Minskar systemisk inflammation", "Förbättrar hudbarriär"],
    description: "Syrad kål innehållande probiotiska lactobaciller som gynnar tarmens mikrobiom. Regelbunden konsumtion kan öka tarmflorans mångfald och stärka tarmbarriären.",
    nutrients: ["Probiotiska bakterier", "Vitamin C", "Vitamin K", "Fiber", "Folat"],
    category: "fermented",
    slug: "surkal"
  },
  {
    name: "Miso",
    swedishName: "Miso (fermenterad sojaböna)",
    origin: "Asiatisk (Japan)",
    healthBenefits: ["Förbättrar hudfukt", "Ökar ceramidnivåer", "Stärker hudbarriär", "Stärker immunförsvar"],
    description: "Fermenterad pasta av soja, rik på probiotiska mikrober samt isoflavonoider. Dagligt intag av misosoppa har visat förbättrad hudfukt och ökad nivå av ceramider i huden.",
    nutrients: ["Probiotiska bakterier", "Isoflavonoider", "Protein", "Natrium", "B-vitaminer"],
    category: "fermented",
    slug: "miso"
  },
  {
    name: "Chaga Mushroom",
    swedishName: "Chaga (sprängticka)",
    origin: "Nordisk",
    healthBenefits: ["Skyddar mot fria radikaler", "Antiinflammatorisk", "Lugnar hudirritation", "Långsammare hudåldrande"],
    description: "Medicinalsvamp mycket rik på antioxidanter (polyfenoler, triterpener) som skyddar celler från fria radikaler. Traditionellt använd för att lugna hudirritation.",
    nutrients: ["Polyfenoler", "Triterpener", "Antioxidanter", "Betulin", "Melanin"],
    category: "mushroom",
    slug: "chaga"
  },
  {
    name: "Soybean",
    swedishName: "Sojaböna (edamame)",
    origin: "Asiatisk/Global",
    healthBenefits: ["Stimulerar kollagensyntes", "Förbättrar fukt och elasticitet", "Bättre hudpigmentering", "Stödjer hudens uppbyggnad"],
    description: "Innehåller isoflavoner (genistein m.fl.) som fungerar som antioxidativa fytoöstrogener. Isoflavoner har visats stimulera kollagensyntes och förbättra hudens fukt och elasticitet.",
    nutrients: ["Isoflavoner", "Protein", "Fiber", "Folat", "Vitamin K"],
    category: "other",
    slug: "sojaböna"
  },
  {
    name: "Bell Pepper",
    swedishName: "Paprika (röd/gul)",
    origin: "Global",
    healthBenefits: ["Avgörande för kollagenbildning", "Hjälper huden hålla fasthet", "Skyddar mot oxidativ skada", "Förbättrar UV-tålighet"],
    description: "Röd och gul paprika är extremt rika på C-vitamin och karotenoider. C-vitamin är avgörande för kollagenbildning och hjälper huden att hålla sig fast och spänstig.",
    nutrients: ["Vitamin C", "Betakaroten", "Lutein", "Zeaxantin", "Folat"],
    category: "vegetable",
    slug: "paprika"
  },
  {
    name: "Broccoli",
    swedishName: "Broccoli",
    origin: "Global",
    healthBenefits: ["Stärker försvar mot solskador", "Minskar inflammation", "Rikt på vitamin C", "Färre solrynkor"],
    description: "Broccoli innehåller sulforafan – en antioxidant som aktiverar skyddsenzym mot UV-strålning. Sulforafan kan stärka hudens försvar mot solskador och minska inflammation.",
    nutrients: ["Sulforafan", "Vitamin C", "Vitamin K", "Folat", "Fiber"],
    category: "vegetable",
    slug: "broccoli"
  },
  {
    name: "Eggs",
    swedishName: "Ägg",
    origin: "Global",
    healthBenefits: ["Viktigt för hud, hår och naglar", "Förhindrar hudutslag och torrhet", "Stödjer hudstruktur", "Skyddar mot oxidativ stress"],
    description: "Äggula är en av de bästa källorna till biotin (vitamin B7). Biotin är viktigt för hud, hår och naglar – brist kan ge hudutslag och torrhet.",
    nutrients: ["Biotin", "Protein", "Lutein", "Zeaxantin", "Vitamin D"],
    category: "other",
    slug: "agg"
  },
  {
    name: "Oysters",
    swedishName: "Ostron",
    origin: "Global",
    healthBenefits: ["Krävs för sårläkning", "Reglerar inflammation", "Antiinflammatorisk vid akne", "Stödjer antioxidantförsvar"],
    description: "Ostron är extremt zinkrika – zink är ett spårämne som krävs för sårläkning, hudreparation och att reglera inflammation. Zink har antiinflammatoriska effekter vid akne, rosacea, eksem.",
    nutrients: ["Zink", "Selen", "Koppar", "Protein", "Vitamin B12"],
    category: "other",
    slug: "ostron"
  },
  {
    name: "Chia Seeds",
    swedishName: "Chiafrön",
    origin: "Global",
    healthBenefits: ["Verkar prebiotiskt", "Minskar inflammation", "Förbättrar fettsyramönster", "Bidrar till hudbarriär"],
    description: "Små frön rika på omega-3 (ALA), fiber och antioxidanter. Fibrerna verkar prebiotiskt i tarmen och ökar gynnsamma stammar, vilket kan minska inflammation som når huden.",
    nutrients: ["Omega-3 (ALA)", "Fiber", "Protein", "Kalcium", "Antioxidanter"],
    category: "nut_seed",
    slug: "chiafron"
  },
  {
    name: "Kefir",
    swedishName: "Kefir (fermenterad mjölk)",
    origin: "Östeuropeisk",
    healthBenefits: ["Återställer bakterieflora", "Reducerar systemisk inflammation", "Lindrar atopiska eksem", "Stärker gut-skin-axeln"],
    description: "Syrlig fermenterad mjölkdryck med både mjölksyrabakterier och jäst. Den breda stammen av probiotika i kefir kan återställa tarmens bakterieflora och reducera systemisk inflammation.",
    nutrients: ["Probiotiska bakterier", "Protein", "Kalcium", "B-vitaminer", "Magnesium"],
    category: "fermented",
    slug: "kefir"
  },
  {
    name: "Orange",
    swedishName: "Apelsin (citrus)",
    origin: "Global",
    healthBenefits: ["Skyddar huden", "Behövs för kollagensyntes", "Förbättrar sårläkning", "Förbättrar hudcirkulation"],
    description: "Citrusfrukter som apelsin är rika på vitamin C – en antioxidant som skyddar huden och behövs för kollagensyntes. God C-vitaminstatus förbättrar sårläkning och hudens spänst.",
    nutrients: ["Vitamin C", "Bioflavonoider", "Folat", "Kalium", "Fiber"],
    category: "fruit",
    slug: "apelsin"
  },
  {
    name: "Watermelon",
    swedishName: "Vattenmelon",
    origin: "Global",
    healthBenefits: ["Minskar UV-inducerad hudskada", "Bättre elasticitet", "Håller huden hydrerad", "Fylligare, mjukare hud"],
    description: "Innehåller mycket lykopen – faktiskt mer än tomater. Lykopen är en antioxidant kopplad till minskad UV-inducerad hudskada och bättre elasticitet. Består av ~90% vatten, vilket hjälper hålla huden hydrerad.",
    nutrients: ["Lykopen", "Vitamin C", "Vitamin A", "Kalium", "Vatten"],
    category: "fruit",
    slug: "vattenmelon"
  },
  {
    name: "Red Grapes",
    swedishName: "Vindruvor (röda)",
    origin: "Global",
    healthBenefits: ["Stimulerar kollagensyntes", "Bevarar hudens spänst", "Skyddar mot UV-strålning", "Bromsar fotoåldrande"],
    description: "Röda druvor ger resveratrol, en polyfenol med välstuderade hudfördelar. Resveratrol är starkt antioxidativt och antiinflammatoriskt – det kan stimulera kollagensyntesen och bevara hudens spänst.",
    nutrients: ["Resveratrol", "Polyfenoler", "Vitamin C", "Vitamin K", "Antioxidanter"],
    category: "berry",
    slug: "vindruvor"
  },
  {
    name: "Seaweed",
    swedishName: "Alger (brunalger/kelp)",
    origin: "Asiatisk/Nordisk",
    healthBenefits: ["Anti-aging-effekter", "Ökar kollagenproduktion", "Påskyndar återhämtning", "Motverkar rynkor"],
    description: "Ätlig sjöväxt rik på marina antioxidanter och mineraler. Brunalger innehåller fucoxantin och fukoidan – ämnen som visat anti-aging-effekter. Fukoidan kan öka hudens kollagenproduktion.",
    nutrients: ["Fucoxantin", "Fukoidan", "Jod", "Omega-3", "Mineraler"],
    category: "other",
    slug: "alger"
  },
  {
    name: "Oats",
    swedishName: "Havre",
    origin: "Nordisk",
    healthBenefits: ["Fungerar som prebiotika", "Gynnar goda tarmbakterier", "Dämpar systemisk inflammation", "Förbättrar hudtillstånd"],
    description: "Fullkorn havre är rikt på lösliga kostfibrer (beta-glukaner) som fermenteras i tjocktarmen och fungerar som prebiotika. En fiberrik kost med havre gynnar goda tarmbakterier.",
    nutrients: ["Beta-glukaner", "Fiber", "Protein", "Mangan", "Fosfor"],
    category: "grain",
    slug: "havre"
  },
  {
    name: "Jerusalem Artichoke",
    swedishName: "Jordärtskocka",
    origin: "Nordisk",
    healthBenefits: ["Prebiotisk fiber", "Göder nyttiga bakterier", "Stärker tarmbarriären", "Minskar inflammationsmarkörer"],
    description: "Rotknöl rik på inulin (prebiotisk fiber). Inulin når tjocktarmen där den selektivt göder nyttiga bakterier (som bifidobakterier). En sådan förbättrad tarmflora stärker tarmbarriären.",
    nutrients: ["Inulin", "Kalium", "Järn", "Fosfor", "Vitamin C"],
    category: "root",
    slug: "jordarskocka"
  },
  {
    name: "Banana",
    swedishName: "Banan",
    origin: "Global",
    healthBenefits: ["Främjar hälsosam tarmflora", "Färre inflammatoriska utslag", "Viktigt för kollagen", "Stödjer enzymfunktioner"],
    description: "Bananer innehåller fructooligosackarider – prebiotiska fibrer som främjar en hälsosam tarmflora. En balanserad tarm med mindre dysbios kan leda till färre inflammatoriska utslag i huden.",
    nutrients: ["Fructooligosackarider", "Vitamin C", "Vitamin B6", "Kalium", "Fiber"],
    category: "fruit",
    slug: "banan"
  },
  {
    name: "Apple",
    swedishName: "Äpple",
    origin: "Global",
    healthBenefits: ["Prebiotisk effekt", "Modulerar tarmfloran", "Förbättrar tarmbarriären", "Minskar systemisk inflammation"],
    description: "Äpplen (särskilt med skal) är rika på pektin, en löslig fiber med prebiotisk effekt. Äpple-pektin har visat sig modulera tarmfloran, förbättra tarmbarriären och minska endotoxiner i blodet.",
    nutrients: ["Pektin", "Quercetin", "Vitamin C", "Fiber", "Kalium"],
    category: "fruit",
    slug: "apple"
  },
  {
    name: "Bone Broth",
    swedishName: "Benbuljong",
    origin: "Global",
    healthBenefits: ["Förbättrar elasticitet och fuktnivå", "Minskar rynkdjup", "Understödjer hudstruktur", "Ökad kollagentillgång"],
    description: "Långkokt buljong på ben frigör kollagen, gelatin och mineraler. Oralt intag av kollagenpeptider/gelatin har i studier visat sig förbättra hudens elasticitet, fuktnivå och minska rynkdjup.",
    nutrients: ["Kollagen", "Gelatin", "Glycin", "Prolin", "Mineraler"],
    category: "other",
    slug: "benbuljong"
  },
  {
    name: "Raw Honey",
    swedishName: "Honung (rå, opastöriserad)",
    origin: "Global",
    healthBenefits: ["Prebiotiska egenskaper", "Göder goda bakterier", "Dämpar systemisk inflammation", "Skyddar hudceller"],
    description: "Naturlig söt råvara med prebiotiska egenskaper – rå honung innehåller oligosackarider som göder tarmens goda bakterier. Rik på antioxidanter (flavonoider) som skyddar hudceller.",
    nutrients: ["Oligosackarider", "Flavonoider", "Antioxidanter", "Enzymer", "Mineraler"],
    category: "other",
    slug: "honung"
  },
  {
    name: "Spinach",
    swedishName: "Spenat",
    origin: "Global",
    healthBenefits: ["Nödvändigt för hudcellomsättning", "Skyddar mot UV-skador", "Stödjer kollagenbildning", "Bidrar till celldelning"],
    description: "Bladgrönsak rik på betakaroten, lutein, vitamin C och folat. Betakaroten omvandlas till vitamin A som är nödvändigt för normal hudcellomsättning och talgbalans.",
    nutrients: ["Betakaroten", "Lutein", "Vitamin C", "Folat", "Järn"],
    category: "vegetable",
    slug: "spenat"
  },
  {
    name: "Pineapple",
    swedishName: "Ananas",
    origin: "Global",
    healthBenefits: ["Reducerar svullnad och rodnad", "Dämpar proinflammatoriska cytokiner", "Lindrar akneinflammation", "Bevarar kollagen"],
    description: "Innehåller enzymet bromelain som har antiinflammatoriska egenskaper. Bromelain kan reducera svullnad, rodnad och dämpa proinflammatoriska cytokiner – därigenom lindras akneinflammation.",
    nutrients: ["Bromelain", "Vitamin C", "Mangan", "Vitamin B6", "Fiber"],
    category: "fruit",
    slug: "ananas"
  },
  {
    name: "Aloe Vera",
    swedishName: "Aloe vera (gel, drickbar)",
    origin: "Global",
    healthBenefits: ["Förbättringar av rynkor", "Ökar hudelasticitet", "Ökad kollagenproduktion", "Minskar UV-utlöst rodnad"],
    description: "Aloe vera-gel är rik på polysackarider och växtsteroler. Studier på oral aloe vera visade signifikanta förbättringar av rynkor och ökad hudelasticitet genom ökad kollagenproduktion.",
    nutrients: ["Polysackarider", "Växtsteroler", "Aminosyror", "Vitaminer", "Mineraler"],
    category: "other",
    slug: "aloe-vera"
  },
  {
    name: "Onion",
    swedishName: "Lök (gul lök)",
    origin: "Global",
    healthBenefits: ["Gynnar tillväxt av goda bakterier", "Förbättrar tarmflorans sammansättning", "Minskar systemisk inflammation", "Dämpar inflammatoriska reaktioner"],
    description: "Lök är rik på inulin, en prebiotisk fiber som gynnar tillväxten av goda tarmbakterier. Genom att äta lök kan man förbättra tarmflorans sammansättning och därmed minska systemisk inflammation.",
    nutrients: ["Inulin", "Quercetin", "Vitamin C", "Folat", "Kalium"],
    category: "vegetable",
    slug: "lok"
  },
  {
    name: "Black Cumin",
    swedishName: "Svartkummin (Nigella sativa)",
    origin: "Västasiatisk",
    healthBenefits: ["Kraftfull antioxidant", "Antiinflammatorisk substans", "Förbättrar inflammatoriska hudåkommor", "Antimikrobiella egenskaper"],
    description: "Svartkumminfrön och -olja innehåller tymokinon, en kraftfull antioxidant och antiinflammatorisk substans. Forskning tyder på att tillskott kan förbättra olika inflammatoriska hudåkommor, inkl. atopiskt eksem och akne.",
    nutrients: ["Tymokinon", "Fettsyror", "Protein", "Fiber", "Mineraler"],
    category: "herb",
    slug: "svartkummin"
  }
];

async function importAllRawMaterials() {
  try {
    console.log('🔄 Starting complete raw materials import...');
    console.log(`Total materials to import: ${allRawMaterials.length}`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const material of allRawMaterials) {
      try {
        const existing = await prisma.rawMaterial.findUnique({
          where: { slug: material.slug }
        });
        
        if (existing) {
          console.log(`⚠️  Skipping ${material.swedishName} - already exists`);
          skipped++;
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
        imported++;
      } catch (error) {
        console.error(`❌ Error importing ${material.swedishName}:`, error);
      }
    }
    
    const totalCount = await prisma.rawMaterial.count();
    console.log(`\n✨ Import complete!`);
    console.log(`📊 Imported: ${imported} new materials`);
    console.log(`⏭️  Skipped: ${skipped} existing materials`);
    console.log(`🎯 Total raw materials in database: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllRawMaterials(); 