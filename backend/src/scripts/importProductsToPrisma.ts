import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Product data based on your existing products
const products = [
  {
    name: "DUO-kit + TA-DA Serum",
    slug: "duo-kit-ta-da-serum",
    description: "Ett komplett hudvårdsset med The ONE Facial Oil, I LOVE Facial Oil och TA-DA Serum för optimal hudvård.",
    shortDescription: "Komplett hudvårdsset med tre produkter",
    price: 1299,
    compareAtPrice: 1499,
    sku: "DUO-TADA-001",
    category: "Kit",
    tags: ["kit", "set", "hudvård", "facial oil", "serum"],
    images: ["/images/products/DUO.png"],
    variants: [],
    inventory: 50,
    trackInventory: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: true,
    metaTitle: "DUO-kit + TA-DA Serum - Komplett hudvårdsset",
    metaDescription: "Få strålande hud med vårt DUO-kit innehållande The ONE, I LOVE och TA-DA Serum. Perfekt för alla hudtyper.",
    seoKeywords: ["hudvård", "facial oil", "serum", "cbd", "cbg", "naturlig hudvård"]
  },
  {
    name: "TA-DA Serum",
    slug: "ta-da-serum",
    description: "Ett kraftfullt anti-age serum med CBD och CBG som hjälper till att minska fina linjer och förbättra hudens elasticitet.",
    shortDescription: "Anti-age serum med CBD och CBG",
    price: 599,
    compareAtPrice: 699,
    sku: "TADA-001",
    category: "Serum",
    tags: ["serum", "anti-age", "cbd", "cbg", "ansiktsvård"],
    images: ["/images/products/TADA.png"],
    variants: [],
    inventory: 30,
    trackInventory: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: true,
    metaTitle: "TA-DA Serum - Anti-age serum med CBD",
    metaDescription: "Kraftfullt anti-age serum med CBD och CBG för yngre och fastare hud. Naturlig hudvård för alla hudtyper.",
    seoKeywords: ["serum", "anti-age", "cbd", "cbg", "ansiktsvård", "naturlig"]
  },
  {
    name: "DUO-kit (The ONE + I LOVE Facial Oil)",
    slug: "duo-kit-the-one-i-love",
    description: "Perfekt kombination av The ONE Facial Oil och I LOVE Facial Oil för komplett ansiktsvård.",
    shortDescription: "DUO-kit med två facial oils",
    price: 999,
    compareAtPrice: 1198,
    sku: "DUO-001",
    category: "Kit",
    tags: ["kit", "facial oil", "duo", "hudvård", "ansiktsvård"],
    images: ["/images/products/DUO.png"],
    variants: [],
    inventory: 40,
    trackInventory: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: true,
    metaTitle: "DUO-kit - The ONE + I LOVE Facial Oil",
    metaDescription: "Kombinera The ONE och I LOVE Facial Oil för optimal hudvård. Naturliga oljor med CBD och CBG.",
    seoKeywords: ["facial oil", "duo kit", "cbd", "cbg", "naturlig hudvård"]
  },
  {
    name: "I LOVE Facial Oil",
    slug: "i-love-facial-oil",
    description: "En lyxig ansiktsolja med CBD och naturliga oljor som ger djup återfuktning och lyster åt huden.",
    shortDescription: "Lyxig ansiktsolja med CBD",
    price: 599,
    compareAtPrice: null,
    sku: "ILOVE-001",
    category: "Facial Oil",
    tags: ["facial oil", "cbd", "återfuktning", "ansiktsvård", "naturlig"],
    images: ["/images/products/ILOVE.png"],
    variants: [],
    inventory: 60,
    trackInventory: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: true,
    metaTitle: "I LOVE Facial Oil - Lyxig ansiktsolja med CBD",
    metaDescription: "Ge din hud djup återfuktning med I LOVE Facial Oil. Naturlig ansiktsolja med CBD för alla hudtyper.",
    seoKeywords: ["facial oil", "cbd", "ansiktsolja", "återfuktning", "naturlig hudvård"]
  },
  {
    name: "The ONE Facial Oil",
    slug: "the-one-facial-oil",
    description: "Den ultimata ansiktsoljan med CBG och adaptogena svampar för optimal hudbalans och strålande hy.",
    shortDescription: "Premium ansiktsolja med CBG",
    price: 599,
    compareAtPrice: null,
    sku: "THEONE-001",
    category: "Facial Oil",
    tags: ["facial oil", "cbg", "svampar", "adaptogen", "premium"],
    images: ["/images/products/TheONE.png"],
    variants: [],
    inventory: 45,
    trackInventory: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: true,
    metaTitle: "The ONE Facial Oil - Premium ansiktsolja med CBG",
    metaDescription: "Premium ansiktsolja med CBG och adaptogena svampar. Perfekt för hudbalans och strålande hy.",
    seoKeywords: ["facial oil", "cbg", "svampar", "adaptogen", "ansiktsolja"]
  },
  {
    name: "Au Naturel Makeup Remover",
    slug: "au-naturel-makeup-remover",
    description: "Mild och effektiv makeupborttagare med naturliga ingredienser som rengör utan att torka ut huden.",
    shortDescription: "Naturlig makeupborttagare",
    price: 299,
    compareAtPrice: 349,
    sku: "NATUREL-001",
    category: "Cleanser",
    tags: ["makeup remover", "rengöring", "naturlig", "mild", "ansiktsrengöring"],
    images: ["/images/products/AuNaturel.png"],
    variants: [],
    inventory: 35,
    trackInventory: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: false,
    metaTitle: "Au Naturel Makeup Remover - Naturlig makeupborttagare",
    metaDescription: "Mild och effektiv makeupborttagare med naturliga ingredienser. Perfekt för känslig hud.",
    seoKeywords: ["makeup remover", "naturlig", "mild", "rengöring", "känslig hud"]
  },
  {
    name: "Fungtastic Mushroom Extract",
    slug: "fungtastic-mushroom-extract",
    description: "Kraftfullt svampextrakt med Chaga, Lions Mane, Reishi och Cordyceps för optimal hälsa och vitalitet.",
    shortDescription: "Premium svampextrakt supplement",
    price: 399,
    compareAtPrice: 499,
    sku: "FUNGI-001",
    category: "Supplement",
    tags: ["svamp", "supplement", "chaga", "lions mane", "reishi", "cordyceps"],
    images: ["/images/products/Fungtastic.png"],
    variants: [],
    inventory: 25,
    trackInventory: true,
    allowBackorder: true,
    isActive: true,
    isFeatured: false,
    metaTitle: "Fungtastic Mushroom Extract - Premium svampextrakt",
    metaDescription: "Kraftfullt svampextrakt med fyra premium svampar för optimal hälsa. Naturligt supplement.",
    seoKeywords: ["svamp", "supplement", "chaga", "lions mane", "reishi", "cordyceps", "hälsa"]
  },
  {
    name: "1753 Skincare Store",
    slug: "1753-skincare-store",
    description: "Allmänna recensioner om 1753 Skincare som butik, kundservice, leverans och övergripande upplevelse.",
    shortDescription: "Butiks- och servicerecensioner",
    price: 0,
    compareAtPrice: 0,
    sku: "STORE-001",
    category: "Store",
    tags: ["butik", "kundservice", "upplevelse", "leverans", "företag"],
    images: ["/images/1753.png"],
    variants: [],
    inventory: 999,
    trackInventory: false,
    allowBackorder: true,
    isActive: true,
    isFeatured: false,
    metaTitle: "1753 Skincare Store - Kundrecensioner",
    metaDescription: "Läs vad våra kunder tycker om 1753 Skincare som butik, kundservice och leverans.",
    seoKeywords: ["1753", "skincare", "butik", "kundservice", "leverans", "recensioner"]
  },
  {
    name: "Store Reviews",
    slug: "store-reviews",
    description: "Allmänna recensioner om 1753 Skincare som butik, kundservice, leverans och övergripande upplevelse.",
    shortDescription: "Butiks- och servicerecensioner",
    price: 0,
    compareAtPrice: 0,
    sku: "STORE-REV-001",
    category: "Store",
    tags: ["butik", "kundservice", "upplevelse", "leverans", "företag"],
    images: ["/images/1753.png"],
    variants: [],
    inventory: 999,
    trackInventory: false,
    allowBackorder: true,
    isActive: true,
    isFeatured: false,
    metaTitle: "1753 Skincare Store - Kundrecensioner",
    metaDescription: "Läs vad våra kunder tycker om 1753 Skincare som butik, kundservice och leverans.",
    seoKeywords: ["1753", "skincare", "butik", "kundservice", "leverans", "recensioner"]
  }
];

async function importProducts() {
  try {
    console.log('🔗 Connecting to PostgreSQL...');
    
    // Clear existing products
    console.log('🗑️ Clearing existing products...');
    await prisma.product.deleteMany();
    
    console.log(`📦 Importing ${products.length} products...`);
    
    for (const productData of products) {
      try {
                 const product = await prisma.product.create({
           data: productData
         });
        
        console.log(`✅ Imported: ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to import ${productData.name}:`, error);
      }
    }
    
    const totalProducts = await prisma.product.count();
    console.log(`🎉 Import completed! Total products: ${totalProducts}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProducts(); 