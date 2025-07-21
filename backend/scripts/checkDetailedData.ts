import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDetailedProduct() {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: 'ta-da-serum' },
      select: {
        name: true,
        longDescription: true,
        ingredientsDetails: true,
        benefitsDetails: true,
        imagesData: true
      }
    });
    
    console.log('📦 TA-DA Serum detailed data:');
    console.log('Long description:', product?.longDescription);
    console.log('Ingredients:', JSON.stringify(product?.ingredientsDetails, null, 2));
    console.log('Benefits:', JSON.stringify(product?.benefitsDetails, null, 2));
    console.log('Images:', JSON.stringify(product?.imagesData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDetailedProduct(); 