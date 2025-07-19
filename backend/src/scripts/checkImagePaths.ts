import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImagePaths() {
  try {
    console.log('🔍 Checking product image paths in database...\n');
    
    const products = await prisma.product.findMany({
      select: {
        name: true,
        slug: true,
        images: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📸 Product Image Paths:');
    console.log('═'.repeat(60));
    
    products.forEach(product => {
      console.log(`✅ ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Images: ${JSON.stringify(product.images)}\n`);
    });

    console.log(`🎯 Total products checked: ${products.length}`);

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImagePaths(); 