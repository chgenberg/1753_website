import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const priceUpdates = [
  {
    slug: 'the-one-facial-oil',
    price: 649,
    name: 'The ONE Facial Oil'
  },
  {
    slug: 'i-love-facial-oil',
    price: 849,
    name: 'I LOVE Facial Oil'
  },
  {
    slug: 'duo-kit-the-one-i-love',
    price: 1099,
    name: 'DUO-kit'
  },
  {
    slug: 'duo-kit-ta-da-serum',
    price: 1498,
    oldPrice: 1798,
    name: 'DUO-kit + TA-DA'
  },
  {
    slug: 'fungtastic-mushroom-extract',
    price: 399,
    name: 'Fungtastic Mushroom Extract'
  },
  {
    slug: 'au-naturel-makeup-remover',
    price: 399,
    name: 'Au Naturel Makeup Remover'
  },
  {
    slug: 'ta-da-serum',
    price: 699,
    name: 'TA-DA Serum'
  }
];

async function updateProductPrices() {
  try {
    console.log('🔄 Updating product prices...');
    
    for (const update of priceUpdates) {
      try {
        const product = await prisma.product.findUnique({
          where: { slug: update.slug }
        });
        
        if (!product) {
          console.log(`❌ Product not found: ${update.name} (${update.slug})`);
          continue;
        }
        
        const updateData: any = {
          price: update.price
        };
        
        if (update.oldPrice) {
          updateData.compareAtPrice = update.oldPrice;
        }
        
        const updated = await prisma.product.update({
          where: { slug: update.slug },
          data: updateData
        });
        
        if (update.oldPrice) {
          console.log(`✅ Updated ${updated.name}: ${update.price} kr (ordinarie ${update.oldPrice} kr)`);
        } else {
          console.log(`✅ Updated ${updated.name}: ${update.price} kr`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${update.name}:`, error);
      }
    }
    
    console.log('\n✨ Price update complete!');
    
  } catch (error) {
    console.error('❌ Price update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductPrices(); 