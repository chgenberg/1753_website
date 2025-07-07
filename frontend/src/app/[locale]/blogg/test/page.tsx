import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BlogPost } from '@/components/blog/BlogPost'

export default function TestBlogPost() {
  const sampleContent = `
Endocannabinoidsystemet är ett ytterst komplext organ som består av en mängd olika komponenter som samverkar för att fungera. Det är b.la. en blandning av hudceller, bakterier, virus, svampar, protista och arkéer. Dessutom så producerar vår hud någonting som heter endocannabinoider – Anandamides och 2-AG. 

Dessa endocannabinoider produceras av huden när de behövs och kontrollerar hudcellerna i epidermis, hårsäckarna, talgkörtlarna och svettkörtlarna. Detta innebär att hudens endocannabinoider har en direkt påverkan för hudens hälsa.

Endocannabinoidernas effekt för hudcellerna i epidermis

Kortfattat kan man säga att både CB1 och CB2 i hudcellerna reglerar hudens naturliga funktion som en barriär mot externa faktorer. Detta genom Proliferation (Cellproliferation är den process genom vilken en cell växer och delar sig för att producera två dotterceller. Cellproliferation leder till en exponentiell ökning av cellantal och är därför en snabb mekanism för vävnadstillväxt."). 

Dessutom så minskar endocannabinoiderna risken för inflammation i huden. Man kan på ett enklare sätt säga att endocannabinoidernas funktion främst är att stärka epidermis barriärfunktion.

Endocannabinoidsystemets (ECS) roll i hudens immunfunktion

är att ständigt kontrollera aktiviteten hos hudens immunförsvar och inflammatoriska system. Detta sker på två olika sätt:

1. Endocannabinoider ger antiinflammatoriska effekter.
2. Hudens ECS förhindrar aktivering av immunförsvaret när det inte verkligen behövs.

ECS funktion för hårsäckarna

Våra hårsäckar uppvisar en livscykel av tillväxt, regression och vilofaser. När hårsäckens CB1-receptorer aktiveras, upphör celldelningen. Detta resulterar i hämmad hårväxt och en längre regressionsfas, även känd som catagen. Att kontrollera ECS-aktivitet i hårsäcken kan vara terapeutiskt lovande för hårväxtstörningar, såsom oönskad hårväxt eller skallighet.

Källor:
Cannabinoid Signaling in the Skin: Therapeutic Potential of the "C(ut)annabinoid" System - https://www.mdpicom/1420-3049/24/5/918/htm
TRP Channel Cannabinoid Receptors in Skin Sensation, Homeostasis, and Inflammation - https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4240254/
`

  return (
    <>
      <Header />
      <main className="pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogPost
            title="Endocannabinoidsystemet i vår hud"
            content={sampleContent}
            author="Christopher Genberg"
            date="9 januari 2023"
            readingTime={5}
            tags={['Endocannabinoidsystem', 'CBD', 'Hudvård', 'Vetenskap']}
            category="Endocannabinoidsystem"
            likes={42}
            comments={7}
          />
        </div>
      </main>
      <Footer />
    </>
  )
} 