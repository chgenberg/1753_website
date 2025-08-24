import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Product image mappings for 2025
const productImageMappings = [
  {
    slug: "duo-kit-the-one-i-love",
    name: "DUO-kit (The ONE + I LOVE Facial Oil)",
    images: [
      { url: "/products_2025/DUO.png", alt: "DUO-kit produktbild", isPrimary: true },
      { url: "/products_2025/DUO_box.png", alt: "DUO-kit förpackning", isPrimary: false }
    ]
  },
  {
    slug: "duo-kit-ta-da-serum",
    name: "DUO-kit + TA-DA Serum",
    images: [
      { url: "/products_2025/DUO_TA-DA.png", alt: "DUO-kit + TA-DA produktbild", isPrimary: true },
      { url: "/products_2025/DUO_TA-DA_box.png", alt: "DUO-kit + TA-DA förpackning", isPrimary: false }
    ]
  },
  {
    slug: "fungtastic-mushroom-extract",
    name: "Fungtastic Mushroom Extract",
    images: [
      { url: "/products_2025/Fungtastic_burk.png", alt: "Fungtastic Mushroom Extract produktbild", isPrimary: true },
      { url: "/products_2025/Fungtastic_burk2.png", alt: "Fungtastic Mushroom Extract alternativ vy", isPrimary: false }
    ]
  },
  {
    slug: "i-love-facial-oil",
    name: "I LOVE Facial Oil",
    images: [
      { url: "/products_2025/I_LOVE_bottle.png", alt: "I LOVE Facial Oil flaska", isPrimary: true },
      { url: "/products_2025/I_LOVE_box.png", alt: "I LOVE Facial Oil förpackning", isPrimary: false }
    ]
  },
  {
    slug: "au-naturel-makeup-remover",
    name: "Au Naturel Makeup Remover",
    images: [
      { url: "/products_2025/MakeupRemover_bottle.png", alt: "Makeup Remover flaska", isPrimary: true },
      { url: "/products_2025/MakeupRemover_box.png", alt: "Makeup Remover förpackning", isPrimary: false }
    ]
  },
  {
    slug: "ta-da-serum",
    name: "TA-DA Serum",
    images: [
      { url: "/products_2025/TA-DA.png", alt: "TA-DA Serum produktbild", isPrimary: true },
      { url: "/products_2025/TA-DA_box.png", alt: "TA-DA Serum förpackning", isPrimary: false }
    ]
  },
  {
    slug: "the-one-facial-oil",
    name: "The ONE Facial Oil",
    images: [
      { url: "/products_2025/The_ONE_bottle.png", alt: "The ONE Facial Oil flaska", isPrimary: true },
      { url: "/products_2025/The_ONE_box.png", alt: "The ONE Facial Oil förpackning", isPrimary: false }
    ]
  }
];

async function updateProductImages() {
  try {
    console.log('🔗 Connecting to database...');
    
    console.log('📸 Updating product images to 2025 versions...\n');
    
    for (const mapping of productImageMappings) {
      try {
        // Find the product by slug
        const product = await prisma.product.findFirst({
          where: { slug: mapping.slug }
        });
        
        if (!product) {
          console.warn(`⚠️  Product not found: ${mapping.name} (${mapping.slug})`);
          continue;
        }
        
        // Update the product images
        const updatedProduct = await prisma.product.update({
          where: { id: product.id },
          data: {
            images: mapping.images
          }
        });
        
        console.log(`✅ Updated: ${mapping.name}`);
        console.log(`   - Primary: ${mapping.images[0].url}`);
        console.log(`   - Secondary: ${mapping.images[1].url}\n`);
        
      } catch (error) {
        console.error(`❌ Failed to update ${mapping.name}:`, error);
      }
    }
    
    console.log('🎉 Product image update completed!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages(); 