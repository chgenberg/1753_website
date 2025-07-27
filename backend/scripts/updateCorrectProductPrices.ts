import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCorrectProductPrices() {
  console.log('🔄 Updating all product prices to correct values...\n');

  try {
    // The ONE Facial Oil - 649 kr
    await prisma.product.update({
      where: { slug: 'the-one-facial-oil' },
      data: {
        price: 649,
        compareAtPrice: null
      }
    });
    console.log('✅ Updated: The ONE Facial Oil - 649 kr');

    // I LOVE Facial Oil - 849 kr
    await prisma.product.update({
      where: { slug: 'i-love-facial-oil' },
      data: {
        price: 849,
        compareAtPrice: null
      }
    });
    console.log('✅ Updated: I LOVE Facial Oil - 849 kr');

    // DUO-kit - 1099 kr
    await prisma.product.update({
      where: { slug: 'duo-kit-the-one-i-love' },
      data: {
        price: 1099,
        compareAtPrice: 1498 // Show savings
      }
    });
    console.log('✅ Updated: DUO-kit - 1099 kr (was 1498 kr)');

    // DUO-kit + TA-DA - 1498 kr
    await prisma.product.update({
      where: { slug: 'duo-kit-ta-da-serum' },
      data: {
        price: 1498,
        compareAtPrice: 1847 // Show savings (649+699+849 = 2197, but reduced to 1847 for better savings display)
      }
    });
    console.log('✅ Updated: DUO-kit + TA-DA Serum - 1498 kr (was 1847 kr)');

    // Au Naturel Makeup Remover - 399 kr
    await prisma.product.update({
      where: { slug: 'au-naturel-makeup-remover' },
      data: {
        price: 399,
        compareAtPrice: null
      }
    });
    console.log('✅ Updated: Au Naturel Makeup Remover - 399 kr');

    // Fungtastic Mushroom Extract - 399 kr
    await prisma.product.update({
      where: { slug: 'fungtastic-mushroom-extract' },
      data: {
        price: 399,
        compareAtPrice: null
      }
    });
    console.log('✅ Updated: Fungtastic Mushroom Extract - 399 kr');

    // TA-DA Serum - 699 kr
    await prisma.product.update({
      where: { slug: 'ta-da-serum' },
      data: {
        price: 699,
        compareAtPrice: null
      }
    });
    console.log('✅ Updated: TA-DA Serum - 699 kr');

    console.log('\n✨ All product prices have been updated to correct values!');

    // Verify the updates
    console.log('\n🔍 Verifying updated prices:');
    const products = await prisma.product.findMany({
      select: { name: true, slug: true, price: true, compareAtPrice: true },
      where: {
        slug: {
          in: [
            'the-one-facial-oil',
            'i-love-facial-oil', 
            'duo-kit-the-one-i-love',
            'duo-kit-ta-da-serum',
            'au-naturel-makeup-remover',
            'fungtastic-mushroom-extract',
            'ta-da-serum'
          ]
        }
      }
    });
    
    products.forEach(p => {
      console.log(`📦 ${p.name}: ${p.price} kr${p.compareAtPrice ? ` (was ${p.compareAtPrice} kr)` : ''}`);
    });

  } catch (error) {
    console.error('❌ Error updating product prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCorrectProductPrices(); 