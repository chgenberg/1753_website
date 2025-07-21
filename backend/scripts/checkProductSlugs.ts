import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductSlugs() {
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        name: true
      }
    });
    
    console.log('📦 Current products in database:');
    products.forEach(product => {
      console.log(`- ${product.name} (slug: ${product.slug})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductSlugs(); 