import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductDescriptions() {
  try {
    console.log('🔄 Updating product descriptions...');

    // Product 1: DUO-kit + TA-DA Serum
    await prisma.product.update({
      where: { slug: 'duo-kit-ta-da-serum' },
      data: {
        name: 'DUO-kit + TA-DA Serum',
        description: 'Våra bästsäljare – Nu som komplett rutinpaket för 1498 kr. Vill du ge din hud ett verkligt lyft – utan att kompromissa med ingredienser, filosofi eller resultat? Då är det här paketet för dig.',
        shortDescription: 'Komplett hudvårdsrutin med tre produkter för optimal hudhälsa',
        price: 1498,
        compareAtPrice: 1798,
        longDescription: `
<div class="product-description">
  <h2>Våra bästsäljare – Nu som komplett rutinpaket för 1498 kr</h2>
  <p>Vill du ge din hud ett verkligt lyft – utan att kompromissa med ingredienser, filosofi eller resultat? Då är det här paketet för dig.</p>
  
  <p>Vi har samlat våra tre mest älskade produkter i en komplett hudvårdsrutin för dig som vill optimera hudens hälsa – inifrån och ut. Paketet kostar <strong>1498 kr</strong> (värde: 1798 kr) och innehåller allt du behöver för att:</p>
  
  <ul>
    <li>Stärka hudens egen balans och motståndskraft</li>
    <li>Minska inflammation och känslighet</li>
    <li>Återfukta på djupet</li>
    <li>Få tillbaka hudens naturliga lyster och spänst</li>
  </ul>

  <h3>Det här ingår i paketet:</h3>
  <ul>
    <li><strong>The ONE Facial Oil</strong> – En skyddande, daglig olja som stärker och återfuktar huden.</li>
    <li><strong>I LOVE Facial Oil</strong> – En lugnande nattolja som hjälper huden att återhämta sig i sömnen.</li>
    <li><strong>TA-DA Serum</strong> – Ett unikt CBG-berikat serum som maximerar oljornas effekt och förser huden med extra näring.</li>
  </ul>

  <p>Tillsammans bildar dessa tre produkter en helhetsrutin som stödjer hudens endocannabinoidsystem och mikrobiella mångfald – två av de viktigaste faktorerna för långsiktig hudhälsa. Denna strategi skiljer sig helt från traditionell hudvård och bygger istället på kroppens egen förmåga till läkning och balans.</p>

  <div class="tip-box">
    <p><strong>Tips!</strong> Vårt serum är formulerat för att appliceras efter oljan – inte före – vilket skiljer sig från klassisk hudvård. Det gör att effekten förstärks och huden blir extra näringsboostad.</p>
  </div>

  <h3>Hudvård som gör skillnad – både nu och i framtiden</h3>
  <p>Den här rutinen är inte framtagen för att maskera hudproblem. Den är utvecklad för att hjälpa huden att fungera bättre på egen hand – med målet att du på sikt ska behöva mindre produkter, inte fler.</p>

  <h3>Tryggt att prova</h3>
  <p>Vi erbjuder <strong>100% nöjd-kund-garanti</strong>. Prova produkterna i 14 dagar – om du inte är nöjd, får du pengarna tillbaka (du står endast för returfrakten).</p>
</div>`,
        howToUse: `
<div class="usage-instructions">
  <h3>Användning:</h3>
  <div class="routine-section">
    <h4>Morgon:</h4>
    <ol>
      <li>Skölj ansiktet med ljummet vatten.</li>
      <li>Applicera 3–4 droppar The ONE Facial Oil.</li>
      <li>Följ upp med 1–2 pump TA-DA Serum.</li>
    </ol>
  </div>
  
  <div class="routine-section">
    <h4>Kväll:</h4>
    <ol>
      <li>Rengör huden (gärna med en naturlig makeup remover).</li>
      <li>Applicera 3–4 droppar I LOVE Facial Oil.</li>
      <li>Avsluta med 1–2 pump TA-DA Serum.</li>
    </ol>
  </div>
</div>`,
        keyIngredients: ['CBD', 'CBG', 'MCT', 'Jojoba'],
        tags: ['kit', 'set', 'hudvård', 'facial oil', 'serum', 'bestseller', 'komplett rutin'],
        benefitsDetails: {
          mainBenefits: [
            'Stärker hudens egen balans och motståndskraft',
            'Minskar inflammation och känslighet', 
            'Återfuktar på djupet',
            'Återställer hudens naturliga lyster och spänst'
          ],
          longTermBenefits: [
            'Stödjer hudens endocannabinoidsystem',
            'Främjar mikrobiell mångfald',
            'Minskar behovet av produkter över tid'
          ]
        }
      }
    });
    console.log('✅ Updated: DUO-kit + TA-DA Serum');

    // Product 2: TA-DA Serum
    await prisma.product.update({
      where: { slug: 'ta-da-serum' },
      data: {
        name: 'TA-DA Serum',
        description: 'Säg hejdå till torr hud med TA-DA Serum! Speciellt framtaget för att boosta din huds naturliga fukt och låsa in den, så att du får en strålande och frisk hy.',
        shortDescription: 'CBG-berikat serum för djup återfuktning och balans',
        price: 699,
        longDescription: `
<div class="product-description">
  <h2>Säg hejdå till torr hud med TA-DA Serum!</h2>
  <p>Torr hud är ett vanligt problem, särskilt i kallare klimat, men det behöver inte vara så. TA-DA Serum är speciellt framtaget för att boosta din huds naturliga fukt och låsa in den, så att du får en strålande och frisk hy.</p>

  <h3>Kraften i CBG</h3>
  <p>I hjärtat av TA-DA Serum finns <strong>CBG (Cannabigerol)</strong>, en kraftfull ingrediens från cannabisplantan. CBG samarbetar med hudens endocannabinoidsystem – ett naturligt nätverk som hjälper till att reglera fuktbalansen – för att förbättra fuktbevaring och minska fuktförlust. Resultatet? Balanserad och näringsrik hud som trivs även i tuffa förhållanden.</p>

  <h3>Fördelar med TA-DA Serum</h3>
  <p>Med vår unika blandning av ekologisk jojobaolja och CBG kan du förvänta dig:</p>
  <ul>
    <li>Minskad risk för inflammation</li>
    <li>Djupt återfuktad hud</li>
    <li>Förbättrad elasticitet och fasthet</li>
  </ul>

  <h3>Varför välja TA-DA Serum?</h3>
  <p>TA-DA Serum har en hög koncentration av CBG (<strong>3% eller 1500 mg</strong>), som erbjuder kraftfulla antioxidantegenskaper. Det gör serumet perfekt för torr, känslig eller inflammerad hud, samtidigt som det förbättrar hudens struktur och elasticitet för en friskare och mer strålande look över tid.</p>

  <div class="guarantee-box">
    <h3>100% Nöjd-Kund-Garanti</h3>
    <p>Vi är så säkra på att du kommer att älska TA-DA Serum att vi erbjuder en 100% nöjd-kund-garanti. Testa produkten i 14 dagar – om du inte är helt nöjd kan du returnera den för full återbetalning (minus frakt).</p>
  </div>
</div>`,
        howToUse: `
<div class="usage-instructions">
  <h3>Så här använder du serumet</h3>
  <p>För bästa resultat, kombinera TA-DA Serum med våra ansiktsoljor:</p>
  
  <div class="routine-section">
    <h4>Morgonrutin:</h4>
    <ol>
      <li>Skölj ansiktet med kallt eller ljummet vatten.</li>
      <li>Applicera 3-4 droppar The ONE Facial Oil.</li>
      <li>Följ upp med 1-2 pump av TA-DA Serum.</li>
    </ol>
  </div>
  
  <div class="routine-section">
    <h4>Kvällsrutin:</h4>
    <ol>
      <li>Ta bort makeup eller orenheter med en naturlig rengöring (vid behov).</li>
      <li>Applicera 3-4 droppar I LOVE Facial Oil.</li>
      <li>Avsluta med 1-2 pump av TA-DA Serum.</li>
    </ol>
  </div>
  
  <p><em>Anpassa mängden så att huden känns ordentligt återfuktad och fräsch.</em></p>
</div>`,
        keyIngredients: ['Jojoba', 'CBG'],
        ingredientsDetails: {
          fullList: [
            'Simmondsia chinensis (Jojoba) Seed Oil*',
            'Cannabigerol (CBG)',
            '*Ekologisk och 100% naturlig'
          ],
          keyActives: {
            'CBG': '3% (1500 mg) - Kraftfull antioxidant'
          },
          claims: ['Fri från starka kemikalier', 'Artificiella doftfri', '100% naturlig']
        }
      }
    });
    console.log('✅ Updated: TA-DA Serum');

    // Product 3: DUO-kit
    await prisma.product.update({
      where: { slug: 'duo-kit-the-one-i-love' },
      data: {
        name: 'DUO-kit',
        description: 'Upplev den ultimata hudvårdsrutinen med vårt DUO-kit! Detta kit innehåller våra fantastiska ansiktsoljor – The ONE Facial Oil och I LOVE Facial Oil – till ett väldigt förmånligt pris.',
        shortDescription: 'The ONE + I LOVE Facial Oil - komplett hudvårdsrutin',
        price: 999,
        compareAtPrice: 1198,
        longDescription: `
<div class="product-description">
  <h2>Upplev den ultimata hudvårdsrutinen med vårt DUO-kit</h2>
  <p>Ge din hud det bästa av två världar med vårt DUO-kit! Detta kit innehåller våra fantastiska ansiktsoljor – <strong>The ONE Facial Oil</strong> och <strong>I LOVE Facial Oil</strong> – till ett väldigt förmånligt pris. Tillsammans skapar de en perfekt harmoni för att ge din hud vård och lyster, oavsett hudtillstånd.</p>

  <h3>Varför DUO-kitet är ett måste för din hud</h3>
  <p>Med detta kit får du en komplett hudvårdsrutin som är enkel och effektiv. The ONE Facial Oil används på morgonen för att skydda och återfukta, medan I LOVE Facial Oil appliceras på kvällen för att reparera och lugna. Resultatet är en strålande och välmående hy – varje dag!</p>

  <div class="customer-reviews">
    <h3>Vad våra kunder säger</h3>
    <p>Våra kunder älskar DUO-kitet, och deras upplevelser säger allt:</p>
    
    <blockquote>
      <p>"Efter att ha provat MÄNGDER av hudvårdsprodukter under flera år så har jag äntligen hittat rätt!! Detta är fantastiskt. Det tog mig några veckor innan jag bestämde mig för att köpa men jag kommer aldrig gå tillbaka till något annat! TACK!!"</p>
      <cite>– Lisen J</cite>
    </blockquote>
    
    <blockquote>
      <p>"Efter två veckor var min hud redan så mycket mer flexibel, efter tre veckor var den som om jag fått bindvävsmassage och ansiktsmask varje morgon och nu efter 4 veckor kan jag bara kalla den magiskt mjuk, flexibel och strålande. Använder Duon och TaDa serumet och den kombinationen är som sagt maaaagisk!"</p>
      <cite>– Cecilia Götherström</cite>
    </blockquote>
  </div>

  <div class="guarantee-box">
    <h3>100% Nöjd-Kund-Garanti</h3>
    <p>Vi är så övertygade om att du kommer älska DUO-kitet att vi erbjuder en <strong>100% nöjd-kund-garanti</strong>. Prova produkterna i 14 dagar, och om du inte är helt nöjd, skicka tillbaka dem till oss – du står bara för returfrakten.</p>
  </div>

  <p>Med DUO-kitet får du en enkel, prisvärd och effektiv lösning för din hudvård. Beställ idag och upplev skillnaden själv!</p>
</div>`,
        howToUse: `
<div class="usage-instructions">
  <h3>Så här använder du DUO-kitet</h3>
  <p>Det är enkelt att få fantastiska resultat:</p>
  
  <div class="routine-section">
    <h4>Morgon:</h4>
    <p>Applicera <strong>The ONE Facial Oil</strong> på ren hud för att starta dagen med återfuktning och skydd.</p>
  </div>
  
  <div class="routine-section">
    <h4>Kväll:</h4>
    <p>Applicera <strong>I LOVE Facial Oil</strong> på ren hud för att låta huden återhämta sig över natten.</p>
  </div>
  
  <p><em>Inga krångliga steg – bara en rutin som fungerar för alla hudtyper!</em></p>
</div>`,
        keyIngredients: ['CBD', 'CBG', 'MCT'],
        tags: ['kit', 'facial oil', 'duo', 'hudvård', 'ansiktsvård', 'paket', 'bestseller']
      }
    });
    console.log('✅ Updated: DUO-kit');

    // Product 4: I LOVE Facial Oil
    await prisma.product.update({
      where: { slug: 'i-love-facial-oil' },
      data: {
        name: 'I LOVE Facial Oil',
        description: 'Ge din hud det bästa med I LOVE Facial Oil. En unik kombination av 5% CBG och 10% CBD som stöder ditt endocannabinoidsystem och ger dig en balanserad, återfuktad och ungdomlig hy.',
        shortDescription: 'Lyxig ansiktsolja med 5% CBG och 10% CBD',
        price: 599,
        longDescription: `
<div class="product-description">
  <h2>Ge din hud det bästa med I LOVE Facial Oil</h2>
  <p>Drömmer du om en hud som strålar av hälsa och självförtroende? I LOVE Facial Oil är här för att förvandla din hudvårdsrutin med en unik kombination av <strong>5% CBG</strong> och <strong>10% CBD</strong>. Denna kraftfulla ansiktsolja stöder ditt endocannabinoidsystem och ger dig en balanserad, återfuktad och ungdomlig hy.</p>

  <h3>Vad gör CBG och CBD så speciella?</h3>
  <ul>
    <li><strong>CBG (Cannabigerol):</strong> Smeknamnet "The Mother of All Cannabinoids" säger allt. Med sina antioxidanta egenskaper lugnar CBG torr, känslig eller inflammerad hud. Den boostar hudens struktur, elasticitet och fuktbalans för en fastare och mer strålande look.</li>
    <li><strong>CBD (Cannabidiol):</strong> En antiinflammatorisk favorit som återfuktar och lindrar huden. CBD förbättrar elasticitet och fasthet, vilket ger dig den där eftertraktade glowen.</li>
  </ul>
  <p>Med <strong>5% CBG (500 mg)</strong> och <strong>10% CBD (1000 mg)</strong> i varje flaska får du en oslagbar duo som arbetar för din hudhälsa på djupet.</p>

  <h3>Vad kan du förvänta dig?</h3>
  <p>I LOVE Facial Oil levererar resultat du kommer att älska:</p>
  <ul>
    <li><strong>Mindre inflammationer</strong> – för en lugn och klar hud.</li>
    <li><strong>Mer glow</strong> – för en strålande och frisk lyster.</li>
    <li><strong>Djup återfuktning</strong> – för en mjuk och smidig känsla.</li>
    <li><strong>Högre elasticitet och fasthet</strong> – för en spänstig och ungdomlig hy.</li>
    <li><strong>Bättre självförtroende</strong> – för att du förtjänar att känna dig fantastisk i din hud!</li>
  </ul>

  <h3>Varför välja I LOVE Facial Oil?</h3>
  <p>Denna ansiktsolja sticker ut med sin höga koncentration av CBG och CBD – två av de mest effektiva ingredienserna för hudvård. Oavsett om du vill ha snabb lindring för torrhet eller långsiktiga förbättringar av hudens elasticitet och lyster, är I LOVE Facial Oil det perfekta valet för alla hudtyper.</p>

  <div class="guarantee-box">
    <h3>100% Nöjd-Kund-Garanti</h3>
    <p>Vi tror så starkt på <strong>I LOVE Facial Oil</strong> att vi erbjuder en <strong>100% nöjd-kund-garanti</strong>. Testa produkten i 14 dagar – om du inte är nöjd, skicka tillbaka den. Du står bara för returfrakten.</p>
  </div>
</div>`,
        howToUse: `
<div class="usage-instructions">
  <h3>Användartips för maximal effekt</h3>
  <p>För bästa resultat, kombinera I LOVE Facial Oil med The ONE Facial Oil:</p>
  <ul>
    <li><strong>Morgon:</strong> Använd The ONE Facial Oil för att skydda och återfukta.</li>
    <li><strong>Kväll:</strong> Applicera I LOVE Facial Oil för att reparera och lugna.</li>
  </ul>
  <p><em>Tänk "The ONE I LOVE" för att enkelt komma ihåg ordningen!</em> Du kan också använda oljan ensam morgon och kväll eller integrera den i din nuvarande hudvårdsrutin.</p>

  <h4>Användning</h4>
  <ul>
    <li><strong>För fet eller normal hud:</strong> Applicera 3–4 droppar på ansikte och hals.</li>
    <li><strong>För torr hud:</strong> Applicera 4–10 droppar.</li>
  </ul>
  <p>Anpassa mängden efter din hudtyp för optimalt resultat.</p>

  <h4>Hur länge räcker produkten?</h4>
  <p>En flaska innehåller ca 200 droppar. Vid användning morgon och kväll (3–4 droppar per gång) räcker den i ca 20–30 dagar. Använder du den en gång om dagen håller den i ca 60 dagar.</p>
</div>`,
        keyIngredients: ['CBD', 'CBG', 'MCT'],
        ingredientsDetails: {
          fullList: [
            'Caprylic/Capric Triglyceride',
            'Cannabidiol (10%)',
            'Cannabigerol (5%)'
          ],
          keyActives: {
            'CBD': '10% (1000 mg) - Antiinflammatorisk',
            'CBG': '5% (500 mg) - Antioxidant'
          },
          claims: ['100% naturliga ingredienser', 'Inga starka kemikalier', 'Artificiella doftfri']
        }
      }
    });
    console.log('✅ Updated: I LOVE Facial Oil');

    // Product 5: The ONE Facial Oil
    await prisma.product.update({
      where: { slug: 'the-one-facial-oil' },
      data: {
        name: 'The ONE Facial Oil',
        description: 'Få en strålande och frisk hud med The ONE Facial Oil. Den ultimata ansiktsoljan med 10% CBD och 0,2% CBG för optimal hudbalans och strålande hy.',
        shortDescription: 'Premium ansiktsolja med 10% CBD för alla hudtyper',
        price: 599,
        longDescription: `
<div class="product-description">
  <h2>Få en strålande och frisk hud med The ONE Facial Oil</h2>
  <p>Läser du detta? Då har du förmodligen en känslig, torr, obalanserad eller blandad hud. Drömmer du om en hy med mer elasticitet, fasthet, glow och lyster? Då är <strong>The ONE Facial Oil</strong> precis vad du behöver – oavsett hudtyp!</p>

  <h3>Vad kan du förvänta dig?</h3>
  <p>Med The ONE Facial Oil får du en ansiktsolja som gör skillnad på riktigt:</p>
  <ul>
    <li><strong>Mindre inflammationer</strong> – för en lugnare och klarare hud.</li>
    <li><strong>Mer glow</strong> – för en strålande och hälsosam lyster.</li>
    <li><strong>Mindre känslighet</strong> – för en starkare hudbarriär.</li>
    <li><strong>Djup återfuktning</strong> – för en mjuk och smidig känsla.</li>
    <li><strong>Högre elasticitet och fasthet</strong> – för en spänstig och ungdomlig hy.</li>
    <li><strong>Bättre självförtroende</strong> – för att du ska känna dig fantastisk i din egen hud!</li>
  </ul>

  <h3>Varför välja The ONE Facial Oil?</h3>
  <p>Denna ansiktsolja är en perfekt blandning av <strong>10% CBD</strong> och <strong>0,2% CBG</strong>, som tillsammans ger både kortsiktiga och långsiktiga fördelar för din hud:</p>
  <ul>
    <li><strong>CBD (Cannabidiol, 1000 mg):</strong> Med sina antiinflammatoriska egenskaper lugnar CBD torr, känslig eller inflammerad hud. Det förbättrar också hudens struktur och elasticitet, vilket ger ökad fasthet och ett naturligt glow.</li>
    <li><strong>CBG (Cannabigerol, 20 mg):</strong> En kraftfull antioxidant som skyddar huden och främjar dess hälsa. CBG boostar elasticitet, lyster och bidrar till en övergripande friskare hy.</li>
  </ul>
  <p>Tillsammans skapar de en unik formula som passar alla hudtyper och levererar synliga resultat.</p>

  <h3>Hur länge räcker produkten?</h3>
  <p>En flaska innehåller ca 200 droppar. Vid användning morgon och kväll (3–4 droppar per gång) räcker den i ca 20–30 dagar. Använder du den en gång om dagen håller den i ca 60 dagar.</p>

  <div class="guarantee-box">
    <h3>100% Nöjd-Kund-Garanti</h3>
    <p>Vi är övertygade om att du kommer att älska <strong>The ONE Facial Oil</strong>. Därför erbjuder vi en 100% nöjd-kund-garanti: Prova produkten i 14 dagar – är du inte helt nöjd kan du skicka tillbaka den. Du står endast för returfrakten.</p>
  </div>
</div>`,
        howToUse: `
<div class="usage-instructions">
  <h3>Användartips för bästa effekt</h3>
  <ul>
    <li>Använd The ONE Facial Oil som en ersättning för din vanliga ansiktsolja eller moisturiser, eller addera den till din befintliga hudvårdsrutin.</li>
    <li>Ett balanserat endocannabinoidsystem (ECS) är avgörande för optimal hudhälsa – denna olja stöttar det naturligt.</li>
  </ul>
  
  <h4>Applicering:</h4>
  <ul>
    <li><strong>För fet eller normal hud:</strong> Applicera 3–4 droppar på ansikte och hals.</li>
    <li><strong>För torr hud:</strong> Applicera 4–10 droppar.</li>
  </ul>
  <p>Anpassa mängden efter vad din hud behöver!</p>
  <p><em>Endast för utvärtes bruk.</em></p>
</div>`,
        keyIngredients: ['CBD', 'CBG', 'MCT'],
        ingredientsDetails: {
          fullList: [
            'Caprylic/Capric Triglyceride',
            'Cannabidiol (10%)',
            'Cannabigerol (0,2%)'
          ],
          keyActives: {
            'CBD': '10% (1000 mg) - Antiinflammatorisk',
            'CBG': '0,2% (20 mg) - Antioxidant'
          },
          claims: ['100% naturliga ingredienser', 'Fri från starka kemikalier', 'Artificiella doftfri']
        }
      }
    });
    console.log('✅ Updated: The ONE Facial Oil');

    // Product 6: Au Naturel Makeup Remover
    await prisma.product.update({
      where: { slug: 'au-naturel-makeup-remover' },
      data: {
        name: 'Au Naturel Makeup Remover',
        description: 'Upptäck hemligheten till ren och frisk hud. Avlägsnar smuts, luftföroreningar och makeup utan att skada din huds naturliga balans.',
        shortDescription: 'Mild och effektiv makeupborttagare med CBD',
        price: 399,
        compareAtPrice: null,
        longDescription: `
<div class="product-description">
  <h2>Upptäck hemligheten till ren och frisk hud med Au Naturel Makeup Remover</h2>
  <p>Vill du avlägsna smuts, luftföroreningar och makeup utan att skada din huds naturliga balans? Au Naturel Makeup Remover är lösningen du har letat efter. Denna unika rengöringsolja är speciellt framtagen för att vårda din hud på djupet – utan att störa dess mikrobiella mångfald eller endocannabinoidsystem. Resultatet? En ren, återfuktad och strålande hy som känns fantastisk.</p>

  <h3>Varför Au Naturel Makeup Remover?</h3>
  <p>Många rengöringsprodukter och makeup removers lovar ren hud men skadar ofta hudens naturliga funktioner i processen. Vi har hittat ett bättre sätt. Au Naturel Makeup Remover kombinerar två kraftfulla ingredienser – <strong>MCT</strong> (medium chain triglycerides) och <strong>CBD</strong> (Cannabidiol) – för att ge dig en skonsam men effektiv rengöring. Denna olja binder sig till fett, smuts och makeup, så att du enkelt kan tvätta bort det med vatten, en bomullspad eller en bomullshandduk. Enkelt, naturligt och snällt mot din hud.</p>

  <h3>Fördelar du kan förvänta dig</h3>
  <p>Med Au Naturel Makeup Remover får du mer än bara en ren hud:</p>
  <ul>
    <li>Enkel avlägsning av smuts, makeup och luftföroreningar.</li>
    <li>Djupt återfuktad hud som känns mjuk och smidig.</li>
    <li>Mindre behov av ansiktsolja efter rengöring.</li>
    <li>Ökad elasticitet och fasthet för en ungdomlig look.</li>
    <li>Skadar inte hudens mikrobiella mångfald eller endocannabinoidsystem.</li>
    <li>Bättre självförtroende med en hud som strålar av hälsa.</li>
  </ul>

  <h3>Kraften i CBD och MCT</h3>
  <p>Vår makeup remover är gjord av endast två ingredienser, båda noga utvalda för sina fantastiska egenskaper:</p>
  <ul>
    <li><strong>MCT (Caprylic/Capric Triglyceride):</strong> Denna lätta olja är perfekt för att lösa upp och avlägsna orenheter utan att täppa till porerna. Den är 9 kolatomer stor i sin molekylära form, vilket gör den idealisk för att binda till fett och smuts.</li>
    <li><strong>CBD (Cannabidiol, 0,2%):</strong> CBD är känt för sina antiinflammatoriska egenskaper, vilket gör det till en drömingrediens för torr, känslig eller inflammerad hud. Det hjälper även till att förbättra hudens struktur och elasticitet, vilket ger en fastare och mer glowig hy.</li>
  </ul>

  <h3>Hur fungerar det?</h3>
  <p>Au Naturel Makeup Remover är enkel att använda och passar alla hudtyper. Applicera ett par droppar på ansiktet, massera in oljan och låt den lösa upp makeup och orenheter. Avlägsna sedan försiktigt med en varm, fuktig handduk eller bomullspad. Din hud lämnas ren, mjuk och redo för nästa steg i din hudvårdsrutin.</p>

  <div class="guarantee-box">
    <h3>100% Nöjd-Kund-Garanti</h3>
    <p>Vi är så säkra på att du kommer att älska Au Naturel Makeup Remover att vi erbjuder en 100% nöjd-kund-garanti. Prova produkten i 14 dagar – om du inte är helt nöjd kan du returnera den för full återbetalning (minus frakt).</p>
  </div>
</div>`,
        howToUse: `
<div class="usage-instructions">
  <h3>Användartips</h3>
  <p>För bästa resultat, kombinera Au Naturel Makeup Remover med våra ansiktsoljor:</p>
  <ul>
    <li><strong>Morgon:</strong> Använd The ONE Facial Oil efter rengöring.</li>
    <li><strong>Kväll:</strong> Använd I LOVE Facial Oil efter rengöring.</li>
  </ul>
  <p>Tänk på ordningen som "The ONE I LOVE Facial Oil" för att enkelt komma ihåg.</p>

  <h4>Användning</h4>
  <p>Applicera ett par droppar på ansiktet och massera in. Avlägsna med en varm, fuktig handduk eller bomullspad. Endast för utvärtes bruk.</p>
</div>`,
        keyIngredients: ['MCT', 'CBD'],
        ingredientsDetails: {
          fullList: [
            'Caprylic/Capric Triglyceride (MCT)',
            'Cannabidiol (CBD, 0,2%)'
          ],
          keyActives: {
            'CBD': '0,2% - Antiinflammatorisk'
          },
          claims: ['100% naturliga ingredienser', 'Fri från starka kemikalier', 'Artificiella doftfri']
        }
      }
    });
    console.log('✅ Updated: Au Naturel Makeup Remover');

    // Product 7: Fungtastic Mushroom Extract
    await prisma.product.update({
      where: { slug: 'fungtastic-mushroom-extract' },
      data: {
        name: 'Fungtastic Mushroom Extract',
        description: 'Upplev naturens kraft med Fungtastic Mushroom Extract. Kombinerar fyra av naturens mest potenta medicinska svampar för att stödja ditt välbefinnande inifrån.',
        shortDescription: 'Premium svampextrakt med Chaga, Lions Mane, Cordyceps & Reishi',
        price: 399,
        compareAtPrice: 499,
        longDescription: `
<div class="product-description">
  <h2>Upplev naturens kraft med Fungtastic Mushroom Extract</h2>
  <p>Välkommen till en ny nivå av hälsa med vårt unika svampextrakt! Fungtastic Mushroom Extract kombinerar fyra av naturens mest potenta medicinska svampar – <strong>Chaga, Lion's Mane, Cordyceps och Reishi</strong> – i en perfekt balans för att stödja ditt välbefinnande inifrån. Varje svamp är noga utvald för sina fantastiska egenskaper och sin förmåga att främja kroppens endocannabinoidsystem (ECS).</p>

  <h3>Varför Fungtastic?</h3>
  <p>Allt började med en fascination för hudens och kroppens endocannabinoidsystem (ECS) – ett nyckelsystem för balans och hälsa. Vi ville hitta ett naturligt sätt att stödja ECS inifrån. Oral CBD var ett alternativ, men eftersom det inte är tillåtet i Sverige utan läkemedelsklassning, sökte vi andra lösningar. Svaret? <strong>Betulinic Acid</strong> – ett kraftfullt ämne som finns i stora mängder i Chaga-svampen. Detta ledde oss vidare till att utforska andra medicinska svampar som Lion's Mane, Cordyceps och Reishi, alla med unika fördelar för både ECS och din hälsa.</p>

  <div class="story-box">
    <h3>Vår unika historia</h3>
    <p>Resan tog oss till Estlands djupa skogar och en passionerad brittisk expert – låt oss kalla honom "R". Han har ägnat åratal åt att perfekta extraktionen av medicinska svampar, med fokus på kvalitet och effektivitet. R vägrar samarbeta med stora företag, men efter många möten gav han oss exklusiv tillgång till hans exceptionella extrakt. Resultatet? 1753 LIFESTYLE – en produkt skapad med passion och expertis.</p>
  </div>

  <h3>Fyra svampar – Fyra fantastiska fördelar</h3>
  <p>Fungtastic Mushroom Extract innehåller en balanserad blandning av:</p>
  
  <div class="mushroom-benefits">
    <div class="mushroom">
      <h4>Chaga (25%) – Stärker immunförsvaret</h4>
      <p>Chaga är en antioxidantrik svamp laddad med Betulinic Acid, polysackarider och betaglukaner. Den kan stödja immunsystemet och minska inflammation, vilket gör den till en favorit för övergripande hälsa.</p>
    </div>
    
    <div class="mushroom">
      <h4>Lion's Mane (25%) – Boostar fokus och minne</h4>
      <p>Känd för sina kognitiva fördelar, kan Lion's Mane förbättra koncentration, minne och hjärnhälsa – perfekt för dig som vill skärpa sinnet.</p>
    </div>
    
    <div class="mushroom">
      <h4>Cordyceps (25%) – Ökar energi och prestation</h4>
      <p>Denna svamp, hämtad från tibetansk och kinesisk medicin, är känd för att höja energinivåerna och stödja fysisk uthållighet.</p>
    </div>
    
    <div class="mushroom">
      <h4>Reishi (25%) – Främjar lugn och sömn</h4>
      <p>Reishi har använts i tusentals år för att främja avslappning, förbättra sömnkvaliteten och ge ett lugnt sinnestillstånd.</p>
    </div>
  </div>

  <h3>Hur fungerar det?</h3>
  <p>Våra svampar är fullpackade med aktiva ämnen som polysackarider, triterpener, betaglukaner, erinaciner, hericenoner, betulinsyra, cordycepin och adenosin. Tillsammans arbetar de för att stödja ditt ECS och ge en helhetsboost till din hälsa. De flesta upplever positiva effekter efter 2–4 veckors användning, även om det kan ta upp till 6 veckor för optimalt resultat.</p>

  <h3>Produktinformation</h3>
  <ul>
    <li><strong>Storlek:</strong> 60 kapslar per burk</li>
    <li><strong>Innehåll:</strong> 400 mg per kapsel (15:1 extrakt)</li>
    <li><strong>Rekommenderad dos:</strong> 2 kapslar dagligen</li>
    <li><strong>Betaglukaner:</strong> Minst 20%</li>
    <li><strong>Ekologiskt:</strong> 100% naturliga ingredienser</li>
  </ul>

  <h3>Vem passar Fungtastic för – och vem bör undvika det?</h3>
  <p>Fungtastic är perfekt för dig som vill stödja din hälsa på ett naturligt sätt. Undvik produkten om du är:</p>
  <ul>
    <li>Gravid</li>
    <li>Ammande</li>
    <li>Allergisk mot någon av ingredienserna</li>
  </ul>

  <h3>Därför ska du välja Fungtastic</h3>
  <p>Med Fungtastic får du ett högkvalitativt, ekologiskt svampextrakt som är fritt från kompromisser och framtaget med genuin omsorg. Vi hoppas att du kommer älska konceptet lika mycket som vi gör!</p>
  
  <p>Med vänliga hälsningar,<br>
  Christopher Genberg<br>
  1753 Skincare</p>
</div>`,
        keyIngredients: ['Chaga', 'Lions Mane', 'Cordyceps', 'Reishi'],
        category: 'Supplement',
        tags: ['svamp', 'supplement', 'chaga', 'lions mane', 'reishi', 'cordyceps', 'hälsa', 'immunförsvar', 'energi', 'fokus']
      }
    });
    console.log('✅ Updated: Fungtastic Mushroom Extract');

    console.log('🎉 All product descriptions updated successfully!');
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductDescriptions(); 