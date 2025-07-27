import { NextRequest, NextResponse } from 'next/server';

// Mock blog posts data
const mockBlogPosts: Record<string, any> = {
  '10-tips-for-akne': {
    id: '1',
    title: '10 tips för akne',
    slug: '10-tips-for-akne',
    content: `
      <h2>10 effektiva tips för att hantera akne naturligt</h2>
      
      <p>Akne är ett av de vanligaste hudproblemen och kan påverka personer i alla åldrar. Här är 10 beprövade metoder för att hantera akne på ett naturligt sätt.</p>
      
      <h3>1. Rengör försiktigt</h3>
      <p>Använd en mild rengöring som inte torkar ut huden. Övrengöring kan faktiskt förvärra akne genom att stimulera ökad oljeproduktion.</p>
      
      <h3>2. Använd CBD-produkter</h3>
      <p>CBD har antiinflammatoriska egenskaper som kan hjälpa till att minska rodnad och irritation från akne. Vårt The ONE Facial Oil innehåller CBD som arbetar med hudens naturliga endocannabinoidsystem.</p>
      
      <h3>3. Undvik att peta på finnar</h3>
      <p>Detta kan sprida bakterier och orsaka ärrbildning. Låt huden läka naturligt.</p>
      
      <h3>4. Använd icke-komedogena produkter</h3>
      <p>Välj produkter som inte täpper igen porerna. Jojoba-olja är ett perfekt exempel på en icke-komedogen ingrediens.</p>
      
      <h3>5. Håll rent runtomkring</h3>
      <p>Byt örngott regelbundet och rengör din mobilskärm för att undvika bakteriespridning.</p>
    `,
    excerpt: 'Upptäck de bästa metoderna för att hantera akne naturligt med CBD och CBG. Lär dig hur cannabinoider kan hjälpa din hud...',
    date: '2024-01-15T00:00:00Z',
    author: 'Christopher Genberg',
    readingTime: '5 min',
    tags: ['akne', 'hudvård', 'cbd', 'naturlig'],
    published: true
  },
  'cbd-och-cbg-cellfornyelse': {
    id: '2',
    title: 'CBD och CBG - Cellförnyelseprocessen',
    slug: 'cbd-och-cbg-cellfornyelse',
    content: `
      <h2>Hur CBD och CBG påverkar hudens cellförnyelse</h2>
      
      <p>Hudens cellförnyelse är en komplex process som påverkas av många faktorer. CBD och CBG kan spela en viktig roll i att optimera denna process.</p>
      
      <h3>Vad är cellförnyelse?</h3>
      <p>Cellförnyelse är processen där gamla hudceller ersätts med nya. Denna process saktar ner med åldern, vilket kan leda till mattare hud och synliga tecken på åldrande.</p>
      
      <h3>CBD:s roll i cellförnyelse</h3>
      <p>CBD arbetar med hudens endocannabinoidsystem för att:</p>
      <ul>
        <li>Minska inflammation som kan störa cellförnyelsen</li>
        <li>Stödja hudens naturliga läkningsprocess</li>
        <li>Hjälpa till att balansera sebumproduktionen</li>
      </ul>
      
      <h3>CBG:s unika egenskaper</h3>
      <p>CBG, känd som "Mother of All Cannabinoids", har sina egna fördelar:</p>
      <ul>
        <li>Kan stimulera cellförnyelse mer effektivt än CBD</li>
        <li>Har stark antibakteriell effekt</li>
        <li>Stödjer hudens barriärfunktion</li>
      </ul>
      
      <h3>Kombinationseffekten</h3>
      <p>När CBD och CBG används tillsammans skapas en synergistisk effekt som kan optimera hudens naturliga förnyelseprocess.</p>
    `,
    excerpt: 'Förstå hur CBD och CBG påverkar hudens naturliga cellförnyelse och kan hjälpa till att återställa hudens balans...',
    date: '2024-01-12T00:00:00Z',
    author: 'Christopher Genberg',
    readingTime: '7 min',
    tags: ['cbd', 'cbg', 'cellförnyelse', 'vetenskap'],
    published: true
  },
  'endocannabinoidsystemet-i-huden': {
    id: '3',
    title: 'Endocannabinoidsystemet i huden',
    slug: 'endocannabinoidsystemet-i-huden',
    content: `
      <h2>En djupgående guide till hudens endocannabinoidsystem</h2>
      
      <p>Endocannabinoidsystemet (ECS) är ett av kroppens viktigaste reglerande system, och det spelar en särskilt viktig roll i hudens hälsa.</p>
      
      <h3>Vad är endocannabinoidsystemet?</h3>
      <p>ECS består av:</p>
      <ul>
        <li>Cannabinoidreceptorer (CB1 och CB2)</li>
        <li>Endocannabinoider (kroppens egna cannabinoider)</li>
        <li>Enzymer som bryter ner endocannabinoider</li>
      </ul>
      
      <h3>ECS i huden</h3>
      <p>I huden reglerar ECS:</p>
      <ul>
        <li>Sebumproduktion</li>
        <li>Cellförnyelse</li>
        <li>Inflammation</li>
        <li>Smärtperception</li>
        <li>Barriärfunktion</li>
      </ul>
      
      <h3>Varför CBD och CBG fungerar</h3>
      <p>CBD och CBG interagerar med detta system på olika sätt:</p>
      <ul>
        <li>CBD förhindrar nedbrytning av kroppens egna endocannabinoider</li>
        <li>CBG kan aktivera receptorer direkt</li>
        <li>Båda har antiinflammatoriska effekter</li>
      </ul>
      
      <h3>Praktiska tillämpningar</h3>
      <p>Genom att stödja ECS med cannabinoider kan vi hjälpa huden att:</p>
      <ul>
        <li>Återställa balans</li>
        <li>Minska inflammation</li>
        <li>Optimera sebumproduktion</li>
        <li>Förbättra barriärfunktionen</li>
      </ul>
    `,
    excerpt: 'En djupgående guide till hur endocannabinoidsystemet fungerar i huden och varför det är så viktigt för hudhälsa...',
    date: '2024-01-10T00:00:00Z',
    author: 'Ebba Genberg',
    readingTime: '6 min',
    tags: ['endocannabinoidsystem', 'vetenskap', 'hud', 'cbd'],
    published: true
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check if we have a mock post for this slug
    const mockPost = mockBlogPosts[slug];
    if (mockPost) {
      return NextResponse.json(mockPost);
    }
    
    // Try to fetch from backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
    const url = `${backendUrl}/api/blog/${slug}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend blog post:', error);
    // Return 404 instead of 500 to show not found page
    return NextResponse.json(
      { error: 'Blog post not found' },
      { status: 404 }
    );
  }
} 