import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Mapping between slugs in txt file and actual database slugs
const slugMapping: { [key: string]: string } = {
  'duo-ta-da': 'duo-kit-ta-da-serum',
  'ta-da-serum': 'ta-da-serum',
  'duo-kit-the-one-i-love-facial-oil': 'duo-kit-the-one-i-love',
  'i-love-facial-oil': 'i-love-facial-oil',
  'facialoil': 'the-one-facial-oil',
  'makeup-remover-au-naturel': 'au-naturel-makeup-remover',
  'fungtastic-extract': 'fungtastic-mushroom-extract'
};

interface ProductData {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  sku: string;
  ean?: string;
  trackInventory: boolean;
  category: string;
  categorySlug: string;
  tags: string[];
  skinTypes: string[];
  benefits: string[];
  howToUse: string;
  ingredients: Array<{
    name: string;
    description: string;
    benefits: string[];
    concentration?: string;
  }>;
  images: Array<{
    url: string;
    alt: string;
    position: number;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

function parseProductsFile(filePath: string): ProductData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  const products: ProductData[] = [];
  let currentProduct: any = {};
  let ingredientCounter = 1;
  let imageCounter = 1;
  
  for (const line of lines) {
    if (line.startsWith('Produktnamn\t')) {
      // Start of new product, save previous if exists
      if (currentProduct.name) {
        products.push(processProduct(currentProduct));
      }
      // Reset for new product
      currentProduct = { ingredients: [], images: [] };
      ingredientCounter = 1;
      imageCounter = 1;
      
      currentProduct.name = line.split('\t')[1];
    } else if (line.startsWith('Slug\t')) {
      const txtSlug = line.split('\t')[1];
      currentProduct.slug = slugMapping[txtSlug] || txtSlug; // Use mapped slug or original
    } else if (line.startsWith('Kort beskrivning\t')) {
      currentProduct.description = line.split('\t')[1];
    } else if (line.startsWith('Lång beskrivning\t')) {
      currentProduct.longDescription = line.split('\t').slice(1).join('\t');
    } else if (line.startsWith('Pris\t')) {
      const priceStr = line.split('\t')[1].replace(/[^\d]/g, '');
      currentProduct.price = parseInt(priceStr) || 0;
    } else if (line.startsWith('SKU\t')) {
      currentProduct.sku = line.split('\t')[1];
    } else if (line.startsWith('EAN\t')) {
      currentProduct.ean = line.split('\t')[1];
    } else if (line.startsWith('Spåra lager\t')) {
      currentProduct.trackInventory = line.split('\t')[1].toLowerCase() === 'ja';
    } else if (line.startsWith('Kategorinamn\t')) {
      currentProduct.category = line.split('\t')[1];
    } else if (line.startsWith('Kategori-slug\t')) {
      currentProduct.categorySlug = line.split('\t')[1];
    } else if (line.startsWith('Taggar\t')) {
      currentProduct.tags = line.split('\t')[1].split(',').map(tag => tag.trim());
    } else if (line.startsWith('Hudtyper\t')) {
      currentProduct.skinTypes = line.split('\t')[1].split(',').map(type => type.trim());
    } else if (line.startsWith('Fördelar\t')) {
      currentProduct.benefits = line.split('\t')[1].split(';').map(benefit => benefit.trim());
    } else if (line.startsWith('Användning\t')) {
      currentProduct.howToUse = line.split('\t')[1];
    } else if (line.startsWith(`Ingrediens ${ingredientCounter} namn\t`)) {
      const ingredient: any = { name: line.split('\t')[1] };
      currentProduct.ingredients.push(ingredient);
    } else if (line.startsWith(`Ingrediens ${ingredientCounter} beskrivning\t`)) {
      if (currentProduct.ingredients[ingredientCounter - 1]) {
        currentProduct.ingredients[ingredientCounter - 1].description = line.split('\t')[1];
      }
    } else if (line.startsWith(`Ingrediens ${ingredientCounter} fördelar\t`)) {
      if (currentProduct.ingredients[ingredientCounter - 1]) {
        currentProduct.ingredients[ingredientCounter - 1].benefits = 
          line.split('\t')[1].split(',').map(benefit => benefit.trim());
      }
    } else if (line.startsWith(`Ingrediens ${ingredientCounter} koncentration\t`)) {
      if (currentProduct.ingredients[ingredientCounter - 1]) {
        currentProduct.ingredients[ingredientCounter - 1].concentration = line.split('\t')[1];
      }
      ingredientCounter++; // Move to next ingredient after concentration
    } else if (line.startsWith(`Bild ${imageCounter} URL\t`)) {
      const imageUrl = line.split('\t')[1] || '';
      if (imageUrl) { // Only add if URL exists
        const image: any = { url: imageUrl, position: imageCounter };
        currentProduct.images.push(image);
      }
    } else if (line.startsWith(`Bild ${imageCounter} Alt-text\t`)) {
      const lastImageIndex = currentProduct.images.length - 1;
      if (lastImageIndex >= 0) {
        currentProduct.images[lastImageIndex].alt = line.split('\t')[1];
      }
    } else if (line.startsWith(`Bild ${imageCounter} Position\t`)) {
      const lastImageIndex = currentProduct.images.length - 1;
      if (lastImageIndex >= 0) {
        currentProduct.images[lastImageIndex].position = parseInt(line.split('\t')[1]) || imageCounter;
      }
      imageCounter++; // Move to next image after position
    } else if (line.startsWith('SEO-titel\t')) {
      currentProduct.seoTitle = line.split('\t')[1];
    } else if (line.startsWith('SEO-beskrivning\t')) {
      currentProduct.seoDescription = line.split('\t')[1];
    } else if (line.startsWith('SEO-nyckelord\t')) {
      currentProduct.seoKeywords = line.split('\t')[1].split(',').map(keyword => keyword.trim());
    }
  }
  
  // Don't forget the last product
  if (currentProduct.name) {
    products.push(processProduct(currentProduct));
  }
  
  return products;
}

function processProduct(raw: any): ProductData {
  return {
    name: raw.name || '',
    slug: raw.slug || '',
    description: raw.description || '',
    longDescription: raw.longDescription || '',
    price: raw.price || 0,
    sku: raw.sku || '',
    ean: raw.ean || undefined,
    trackInventory: raw.trackInventory || false,
    category: raw.category || 'Hudvård',
    categorySlug: raw.categorySlug || 'hudvard',
    tags: raw.tags || [],
    skinTypes: raw.skinTypes || [],
    benefits: raw.benefits || [],
    howToUse: raw.howToUse || '',
    ingredients: raw.ingredients || [],
    images: raw.images || [],
    seo: {
      title: raw.seoTitle || raw.name || '',
      description: raw.seoDescription || raw.description || '',
      keywords: raw.seoKeywords || []
    }
  };
}

async function updateProducts() {
  try {
    console.log('🔄 Starting product import...');
    
    const filePath = path.join(process.cwd(), '..', 'frontend', 'public', '1753-products-blocks.txt');
    const products = parseProductsFile(filePath);
    
    console.log(`📦 Found ${products.length} products to update`);
    
    for (const productData of products) {
      console.log(`🔄 Updating product: ${productData.name} (${productData.slug})`);
      
      // Find existing product by slug
      const existingProduct = await prisma.product.findUnique({
        where: { slug: productData.slug }
      });
      
      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { slug: productData.slug },
          data: {
            name: productData.name,
            description: productData.description,
            shortDescription: productData.description,
            price: productData.price,
            sku: productData.sku,
            barcode: productData.ean,
            category: productData.category,
            tags: productData.tags,
            trackInventory: productData.trackInventory,
            metaTitle: productData.seo.title,
            metaDescription: productData.seo.description,
            seoKeywords: productData.seo.keywords,
            keyIngredients: productData.ingredients.map(ing => ing.name),
            howToUse: productData.howToUse,
            skinTypes: productData.skinTypes,
            skinConcerns: productData.benefits,
            // Store additional data as JSON
            longDescription: productData.longDescription,
            ingredientsDetails: productData.ingredients,
            benefitsDetails: productData.benefits,
            imagesData: productData.images
          }
        });
        console.log(`✅ Updated: ${productData.name}`);
        console.log(`   - Added ${productData.ingredients.length} ingredients`);
        console.log(`   - Added ${productData.benefits.length} benefits`);
        console.log(`   - Added ${productData.images.length} images`);
      } else {
        console.log(`⚠️  Product not found: ${productData.slug} - skipping`);
      }
    }
    
    console.log('🎉 Product import completed successfully!');
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProducts(); 