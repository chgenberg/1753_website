import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDuoKitImage() {
  try {
    console.log('🔄 Updating DUO-kit + TA-DA Serum product image...');

    // Update the DUO-kit + TA-DA Serum product to use the correct image
    const result = await prisma.product.update({
      where: { slug: 'duo-kit-ta-da-serum' },
      data: {
        images: ["/images/products/DUO_TA-DA.png"]
      }
    });

    console.log(`✅ Successfully updated ${result.name} image to DUO_TA-DA.png`);

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDuoKitImage(); 