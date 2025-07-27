import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductBenefits() {
  console.log('🔄 Updating product benefits with better Swedish descriptions...\n');

  try {
    // The ONE Facial Oil
    await prisma.product.update({
      where: { slug: 'the-one-facial-oil' },
      data: {
        benefitsDetails: [
          'Lugnar irriterad och känslig hud effektivt',
          'Stärker hudens naturliga barriärfunktion',
          'Ger huden en mjuk och naturlig lyster',
          'Återfuktar djupt utan att kännas oljig'
        ],
        skinConcerns: [
          'Lugnar irriterad och känslig hud effektivt',
          'Stärker hudens naturliga barriärfunktion', 
          'Ger huden en mjuk och naturlig lyster',
          'Återfuktar djupt utan att kännas oljig'
        ]
      }
    });
    console.log('✅ Updated: The ONE Facial Oil');

    // TA-DA Serum
    await prisma.product.update({
      where: { slug: 'ta-da-serum' },
      data: {
        benefitsDetails: [
          'Återfuktar huden på djupet med långvarig effekt',
          'Minskar inflammation och rodnad naturligt',
          'Förbättrar hudens fasthet och naturliga glow',
          'Balanserar hudens fuktbarriär optimalt'
        ],
        skinConcerns: [
          'Återfuktar huden på djupet med långvarig effekt',
          'Minskar inflammation och rodnad naturligt',
          'Förbättrar hudens fasthet och naturliga glow',
          'Balanserar hudens fuktbarriär optimalt'
        ]
      }
    });
    console.log('✅ Updated: TA-DA Serum');

    // Fungtastic Mushroom Extract
    await prisma.product.update({
      where: { slug: 'fungtastic-mushroom-extract' },
      data: {
        benefitsDetails: [
          'Ökar energinivåerna naturligt och hållbart',
          'Stärker immunförsvaret med adaptogena svampar',
          'Förbättrar mental fokus och koncentration',
          'Stödjer kroppens naturliga återhämtning'
        ],
        skinConcerns: [
          'Ökar energinivåerna naturligt och hållbart',
          'Stärker immunförsvaret med adaptogena svampar',
          'Förbättrar mental fokus och koncentration',
          'Stödjer kroppens naturliga återhämtning'
        ]
      }
    });
    console.log('✅ Updated: Fungtastic Mushroom Extract');

    // DUO-kit (The ONE + I LOVE)
    await prisma.product.update({
      where: { slug: 'duo-kit-the-one-i-love' },
      data: {
        benefitsDetails: [
          'Skyddar huden optimal under dagen',
          'Reparerar och återställer huden under natten',
          'Reducerar rodnad och torrhet effektivt',
          'Ger huden en strålande och hälsosam glow',
          'Komplett hudvårdsrutin i en enkel duo'
        ],
        skinConcerns: [
          'Skyddar huden optimal under dagen',
          'Reparerar och återställer huden under natten', 
          'Reducerar rodnad och torrhet effektivt',
          'Ger huden en strålande och hälsosam glow',
          'Komplett hudvårdsrutin i en enkel duo'
        ]
      }
    });
    console.log('✅ Updated: DUO-kit');

    // I LOVE Facial Oil
    await prisma.product.update({
      where: { slug: 'i-love-facial-oil' },
      data: {
        benefitsDetails: [
          'Minskar rodnad och hudirritation naturligt',
          'Återfuktar intensivt utan att täppa till porer',
          'Ökar hudens elasticitet och spänst',
          'Ger en strålande och ungdomlig lyster',
          'Stödjer hudens naturliga reparationsprocess'
        ],
        skinConcerns: [
          'Minskar rodnad och hudirritation naturligt',
          'Återfuktar intensivt utan att täppa till porer',
          'Ökar hudens elasticitet och spänst',
          'Ger en strålande och ungdomlig lyster',
          'Stödjer hudens naturliga reparationsprocess'
        ]
      }
    });
    console.log('✅ Updated: I LOVE Facial Oil');

    // Au Naturel Makeup Remover
    await prisma.product.update({
      where: { slug: 'au-naturel-makeup-remover' },
      data: {
        benefitsDetails: [
          'Löser upp makeup och orenheter skonsamt',
          'Återfuktar huden samtidigt som den rengör',
          'Bevarar hudens naturliga barriärfunktion',
          'Lämnar huden mjuk och balanserad',
          'Passar känslig hud och ögonområdet'
        ],
        skinConcerns: [
          'Löser upp makeup och orenheter skonsamt',
          'Återfuktar huden samtidigt som den rengör',
          'Bevarar hudens naturliga barriärfunktion',
          'Lämnar huden mjuk och balanserad',
          'Passar känslig hud och ögonområdet'
        ]
      }
    });
    console.log('✅ Updated: Au Naturel Makeup Remover');

    console.log('\n✨ All product benefits have been updated with better Swedish descriptions!');

  } catch (error) {
    console.error('❌ Error updating product benefits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductBenefits(); 