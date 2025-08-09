#!/usr/bin/env ts-node
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type RM = {
  name: string
  swedishName: string
  origin: string
  category: string
  slug: string
  description: string
  healthBenefits: string[]
  nutrients: string[]
  howToUse?: string
  dosage?: string
  precautions?: string
  metaTitle?: string
  metaDescription?: string
  references?: string[]
  studies?: string[]
}

const items: RM[] = [
  {
    name: 'Blueberry',
    swedishName: 'Blåbär',
    origin: 'Nordisk',
    category: 'berry',
    slug: 'blabar',
    description: 'Blåbär är rika på antocyaniner och andra polyfenoler som motverkar oxidativ stress och stödjer hudens kollagen och elasticitet.',
    healthBenefits: ['Antioxidanter', 'Antiinflammatoriskt', 'Stödjer kollagen'],
    nutrients: ['Antocyaniner', 'Vitamin C', 'Vitamin K', 'Mangan'],
    howToUse: 'Som hel frukt, smoothie eller pulver',
    dosage: '1–2 dl dagligen',
    metaTitle: 'Blåbär – Antioxidanter för hudhälsa',
    metaDescription: 'Blåbärs antocyaniner stödjer hudens kollagen och skyddar mot oxidativ stress.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/22846072/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/14640573/']
  },
  {
    name: 'Sea Buckthorn',
    swedishName: 'Havtorn',
    origin: 'Nordisk/Asiatisk',
    category: 'berry',
    slug: 'havtorn',
    description: 'Havtorn innehåller omega‑7 (palmitoleinsyra), karotenoider och E‑vitamin som stödjer hudbarriär och fuktbalans.',
    healthBenefits: ['Stärker hudbarriären', 'Fuktbalans', 'Antioxidanter'],
    nutrients: ['Omega‑7', 'Karotenoider', 'Vitamin E'],
    howToUse: 'Juice, olja eller kapslar',
    dosage: '1–2 msk olja dagligen eller enligt produkt',
    metaTitle: 'Havtorn – Omega‑7 för hudbarriären',
    metaDescription: 'Havtornsolja stödjer hudens fukt och elasticitet genom omega‑7 och antioxidanter.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/25208724/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/25810863/']
  },
  {
    name: 'Green Tea',
    swedishName: 'Grönt te',
    origin: 'Asiatisk',
    category: 'tea',
    slug: 'gront-te',
    description: 'Grönt te (EGCG) har starka antioxidativa och antiinflammatoriska egenskaper som kan stödja hudens motståndskraft och fotoprotektion.',
    healthBenefits: ['Antioxidanter', 'Fotoprotektion', 'Anti‑inflammatoriskt'],
    nutrients: ['EGCG', 'Katechiner'],
    howToUse: 'Bryggt te eller matcha',
    dosage: '1–3 koppar dagligen',
    metaTitle: 'Grönt te – EGCG för hud',
    metaDescription: 'EGCG bidrar till antioxidanter och kan stödja hudens försvar mot oxidativ stress.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/17933496/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/16945175/']
  },
  {
    name: 'Turmeric',
    swedishName: 'Gurkmeja',
    origin: 'Asiatisk',
    category: 'herb',
    slug: 'gurkmeja',
    description: 'Gurkmejans aktiva ämne curcumin har antiinflammatoriska och antioxidativa effekter som kan bidra till jämnare hudton.',
    healthBenefits: ['Antiinflammatorisk', 'Antioxidant'],
    nutrients: ['Curcumin'],
    howToUse: 'Matlagning eller kapslar (med pepparin)',
    dosage: '500–1000 mg curcumin/dag (enl. produkt)',
    metaTitle: 'Gurkmeja – Curcumin för hudhälsa',
    metaDescription: 'Curcumin kan stödja hudens antioxidativa försvar och minska inflammation.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/17569207/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/26528921/']
  },
  {
    name: 'Kefir',
    swedishName: 'Kefir',
    origin: 'Kaukasisk',
    category: 'fermented',
    slug: 'kefir',
    description: 'Fermenterad mjölkdryck rik på probiotika som kan stödja tarm‑hud‑axeln och hudens immunbalans.',
    healthBenefits: ['Probiotika', 'Tarmbalans'],
    nutrients: ['Probiotiska kulturer', 'Protein'],
    howToUse: 'Drick som dryck eller i smoothie',
    dosage: '1 glas dagligen',
    metaTitle: 'Kefir – Probiotika för hud via tarmen',
    metaDescription: 'Kefir tillför probiotika som kan stödja tarm‑hud‑axeln.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/28886692/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/29756803/']
  },
  {
    name: 'Kimchi',
    swedishName: 'Kimchi',
    origin: 'Koreansk',
    category: 'fermented',
    slug: 'kimchi',
    description: 'Fermenterad kål med probiotika och bioaktiva ämnen som kan bidra till hudens balans via tarmfloran.',
    healthBenefits: ['Probiotika', 'Antioxidanter'],
    nutrients: ['Lactobacillus spp.', 'Vitaminer'],
    howToUse: 'Som tillbehör',
    dosage: '1–2 portioner/vecka eller mer',
    metaTitle: 'Kimchi – Fermenterat för hudbalans',
    metaDescription: 'Kimchi tillför probiotika och antioxidanter som stödjer tarm‑hud‑axeln.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/26443830/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/28769823/']
  },
  {
    name: 'Chia Seeds',
    swedishName: 'Chiafrön',
    origin: 'Sydamerikansk',
    category: 'nut_seed',
    slug: 'chiafron',
    description: 'Chiafrön är en växtbaserad källa till omega‑3 (ALA) som kan stödja hudens fuktbalans och elasticitet.',
    healthBenefits: ['Omega‑3', 'Fuktbalans'],
    nutrients: ['ALA', 'Fiber', 'Protein'],
    howToUse: 'Blötlägg i pudding eller strö på mat',
    dosage: '1–2 msk dagligen',
    metaTitle: 'Chia – Växtbaserade omega‑3',
    metaDescription: 'Omega‑3 från chia kan stödja hudbarriären och fukt.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/22591897/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/21118617/']
  },
  {
    name: 'Tomato (Lycopene)',
    swedishName: 'Tomat (lycopen)',
    origin: 'Medelhav',
    category: 'vegetable',
    slug: 'tomat-lycopen',
    description: 'Lycopen är en karotenoid som kan bidra till fotoprotektion och förbättrad hudtextur.',
    healthBenefits: ['Fotoprotektion', 'Antioxidant'],
    nutrients: ['Lycopen'],
    howToUse: 'Tillagad tomat, tomatpuré',
    dosage: '10–20 mg lycopen/dag (via mat)',
    metaTitle: 'Tomat – Lycopen för hud',
    metaDescription: 'Lycopen kan bidra till hudens skydd mot solinducerad stress.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/17914175/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/17109333/']
  },
  {
    name: 'Pomegranate',
    swedishName: 'Granatäpple',
    origin: 'Mellanöstern',
    category: 'fruit',
    slug: 'granatapple',
    description: 'Polyfenolrik frukt som kan stödja hudens kollagen och motverka oxidativ stress.',
    healthBenefits: ['Antioxidanter', 'Kollagenstöd'],
    nutrients: ['Punicalaginer', 'Vitamin C'],
    howToUse: 'Kärnor, juice eller extrakt',
    dosage: '1 glas juice eller enligt produkt',
    metaTitle: 'Granatäpple – Polyfenoler för hud',
    metaDescription: 'Granatäpple innehåller polyfenoler som kan stödja hudens struktur.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/20041927/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/18037926/']
  },
  {
    name: 'Cocoa (Cacao)',
    swedishName: 'Kakao',
    origin: 'Sydamerika',
    category: 'other',
    slug: 'kakao',
    description: 'Flavanolrik kakao kan förbättra hudens mikrocirkulation och elasticitet.',
    healthBenefits: ['Mikrocirkulation', 'Antioxidant'],
    nutrients: ['Kakaoflavanoler'],
    howToUse: 'Osötad kakao eller mörk choklad (hög kakaohalt)',
    dosage: '10–20 g mörk choklad/dag',
    metaTitle: 'Kakao – Flavanoler för hud',
    metaDescription: 'Kakaoflavanoler kan påverka hudens mikrocirkulation positivt.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/16505273/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/15749830/']
  },
  {
    name: 'Grape Seed Extract',
    swedishName: 'Druvkärneextrakt',
    origin: 'Europa',
    category: 'other',
    slug: 'druvkarneextrakt',
    description: 'OPC (oligomeriska proantocyanidiner) med antioxidativ kapacitet som kan stödja hudens struktur.',
    healthBenefits: ['Antioxidant', 'Kollagenstöd'],
    nutrients: ['OPC'],
    howToUse: 'Kapslar/tabletter',
    dosage: '100–300 mg/dag (enl. produkt)',
    metaTitle: 'Druvkärneextrakt – OPC för hud',
    metaDescription: 'OPC kan stödja hudens kollagen och reducera oxidativ stress.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/19172663/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/15749778/']
  },
  {
    name: 'Salmon (Omega‑3)',
    swedishName: 'Lax (omega‑3)',
    origin: 'Nordisk',
    category: 'fish',
    slug: 'lax-omega-3',
    description: 'Fet fisk är rik på EPA/DHA som kan minska inflammation och stödja hudens barriär och lyster.',
    healthBenefits: ['Anti‑inflammatoriskt', 'Barriärstöd'],
    nutrients: ['EPA', 'DHA', 'Vitamin D'],
    howToUse: 'Ät som måltid 2–3 ggr/vecka',
    dosage: '2–3 portioner/vecka',
    metaTitle: 'Lax – Omega‑3 för hudhälsa',
    metaDescription: 'Omega‑3 från fet fisk stödjer hudens barriär och minskar inflammation.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/17604292/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/24279807/']
  },
  {
    name: 'Flaxseed',
    swedishName: 'Linfrö',
    origin: 'Nordisk',
    category: 'nut_seed',
    slug: 'linfro',
    description: 'Växtbaserad källa till ALA som kan gynna hudbarriären. Ska konsumeras i måttliga mängder (cyanogena glykosider).',
    healthBenefits: ['Omega‑3 (ALA)', 'Fuktbalans'],
    nutrients: ['ALA', 'Fiber'],
    howToUse: 'Krossade linfrön på gröt/smoothie',
    dosage: 'Max 1–2 msk/dag enligt livsmedelsverkets råd',
    metaTitle: 'Linfrö – ALA för hud',
    metaDescription: 'Linfrö bidrar med ALA som kan stödja hudbarriären.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/19083467/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/21118617/']
  },
  {
    name: 'Rosehip',
    swedishName: 'Nypon',
    origin: 'Nordisk',
    category: 'fruit',
    slug: 'nypon',
    description: 'Nypon är rika på vitamin C och karotenoider som stödjer kollagenbildning och hudens antioxidativa försvar.',
    healthBenefits: ['Kollagenstöd', 'Antioxidant'],
    nutrients: ['Vitamin C', 'Karotenoider'],
    howToUse: 'Te, pulver eller soppa',
    dosage: 'Enligt produkt',
    metaTitle: 'Nypon – Vitamin C för kollagen',
    metaDescription: 'Nypon kan bidra till hudens kollagen och lyster.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/23695457/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/28485657/']
  },
  {
    name: 'Camu Camu',
    swedishName: 'Camu camu',
    origin: 'Amazona',
    category: 'fruit',
    slug: 'camu-camu',
    description: 'Extremt C‑vitaminrikt bär som kan stödja kollagen och antioxidantförsvar.',
    healthBenefits: ['Antioxidant', 'Kollagenstöd'],
    nutrients: ['Vitamin C', 'Polyfenoler'],
    howToUse: 'Pulver i smoothie/vatten',
    dosage: '1 tsk/dag (enl. produkt)',
    metaTitle: 'Camu camu – C‑vitamin för hud',
    metaDescription: 'Camu camu stödjer kollagen och antioxidativ kapacitet.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/21373191/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/22751337/']
  },
  {
    name: 'Astaxanthin',
    swedishName: 'Astaxantin',
    origin: 'Alger/Marin',
    category: 'other',
    slug: 'astaxantin',
    description: 'Karotenoid från mikroalger som kan stödja hudens elasticitet och fotoprotektion.',
    healthBenefits: ['Antioxidant', 'Fotoprotektion'],
    nutrients: ['Astaxantin'],
    howToUse: 'Kapslar (alg‑odlad astaxantin)',
    dosage: '4–8 mg/dag (enl. produkt)',
    metaTitle: 'Astaxantin – Karotenoid för hud',
    metaDescription: 'Astaxantin kan stödja hudens elasticitet och skydd mot solstress.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/20838443/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/21076713/']
  },
  {
    name: 'Spirulina',
    swedishName: 'Spirulina',
    origin: 'Alger',
    category: 'other',
    slug: 'spirulina',
    description: 'Näringsrik mikroalg med proteiner, pigment och antioxidanter som kan stödja hudens näringstillförsel.',
    healthBenefits: ['Antioxidant', 'Näringsstöd'],
    nutrients: ['Protein', 'Fykocyanin', 'Betakaroten'],
    howToUse: 'Pulver eller tabletter',
    dosage: '1–3 g/dag (enl. produkt)',
    metaTitle: 'Spirulina – Näringsstöd för hud',
    metaDescription: 'Spirulina innehåller antioxidanter och mikronäring som kan gynna huden.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/12639401/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/18296327/']
  },
  {
    name: 'Collagen Peptides',
    swedishName: 'Kollagenpeptider',
    origin: 'Marin/Bovin',
    category: 'other',
    slug: 'kollagenpeptider',
    description: 'Kollagenpeptider kan förbättra hudens elasticitet och fuktnivåer enligt flera RCTs.',
    healthBenefits: ['Elasticitet', 'Fuktbalans'],
    nutrients: ['Kollagenpeptider'],
    howToUse: 'Pulver i dryck',
    dosage: '2.5–10 g/dag',
    metaTitle: 'Kollagen – Stöd för hudens elasticitet',
    metaDescription: 'Orala kollagenpeptider har visat förbättrad hudelasticitet i studier.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/23949208/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/28661405/']
  },
  {
    name: 'Aloe Vera Juice',
    swedishName: 'Aloe vera (juice)',
    origin: 'Afrika',
    category: 'other',
    slug: 'aloe-vera-juice',
    description: 'Aloe vera kan bidra till hudens fuktbalans och lugnande effekt även via oralt intag.',
    healthBenefits: ['Fuktbalans', 'Lugnande'],
    nutrients: ['Polysackarider'],
    howToUse: 'Drick enligt produkt',
    dosage: 'Enligt produkt',
    metaTitle: 'Aloe vera – Fukt och balans',
    metaDescription: 'Aloe vera juice kan stödja hudens fukt och balans.',
    references: ['https://pubmed.ncbi.nlm.nih.gov/21450149/'],
    studies: ['https://pubmed.ncbi.nlm.nih.gov/23934222/']
  }
]

async function upsertRawMaterials() {
  for (const it of items) {
    await prisma.rawMaterial.upsert({
      where: { slug: it.slug },
      update: {
        name: it.name,
        swedishName: it.swedishName,
        origin: it.origin,
        category: it.category,
        description: it.description,
        healthBenefits: it.healthBenefits,
        nutrients: it.nutrients,
        howToUse: it.howToUse,
        dosage: it.dosage,
        precautions: it.precautions,
        metaTitle: it.metaTitle,
        metaDescription: it.metaDescription,
        references: it.references || [],
        studies: it.studies || [],
        isActive: true
      },
      create: {
        name: it.name,
        swedishName: it.swedishName,
        origin: it.origin,
        category: it.category,
        slug: it.slug,
        description: it.description,
        healthBenefits: it.healthBenefits,
        nutrients: it.nutrients,
        howToUse: it.howToUse,
        dosage: it.dosage,
        precautions: it.precautions,
        metaTitle: it.metaTitle,
        metaDescription: it.metaDescription,
        references: it.references || [],
        studies: it.studies || [],
        isActive: true
      }
    })
    console.log(`Upserted raw material: ${it.swedishName}`)
  }
}

async function main() {
  await upsertRawMaterials()
  console.log('Raw materials seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() }) 