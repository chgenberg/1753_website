import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDuoKitImages() {
  try {
    console.log('🔄 Updating DUO kit product images...');

    // Update DUO-kit + TA-DA Serum to use DUO_TA-DA.png
    const tadaResult = await prisma.product.update({
      where: { slug: 'duo-kit-ta-da-serum' },
      data: {
        images: ["/images/products/DUO_TA-DA.png"]
      }
    });

    console.log(`✅ Updated ${tadaResult.name} image to DUO_TA-DA.png`);

    // Update DUO-kit (The ONE + I LOVE) to use DUO.png
    const duoResult = await prisma.product.update({
      where: { slug: 'duo-kit-the-one-i-love' },
      data: {
        images: ["/images/products/DUO.png"]
      }
    });

    console.log(`✅ Updated ${duoResult.name} image to DUO.png`);

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDuoKitImages(); 