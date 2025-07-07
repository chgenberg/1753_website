import fs from 'fs'
import path from 'path'
import { Product } from '../models/Product'
import connectDB from '../config/database'

interface ProductRow {
  'Produktnamn': string
  'Slug': string
  'Kort beskrivning': string
  'Lång beskrivning': string
  'Pris': string
  'SKU': string
  'EAN': string
  'Lagersaldo': string
  'Spåra lager': string
  'Kategorinamn': string
  'Kategori-slug': string
  'Taggar': string
  'Hudtyper': string
  'Fördelar': string
  'Användning': string
  'Ingrediens 1 namn': string
  'Ingrediens 1 beskrivning': string
  'Ingrediens 1 fördelar': string
  'Ingrediens 1 koncentration': string
  'Bild 1 URL': string
  'Bild 1 Alt-text': string
  'Bild 1 Position': string
  'Bild 2 URL': string
  'Bild 2 Alt-text': string
  'Bild 2 Position': string
  'SEO-titel': string
  'SEO-beskrivning': string
  'SEO-nyckelord': string
}

// Map product slugs to image filenames
const imageMap: { [key: string]: string } = {
  'duo-ta-da': 'DUO.png',
  'ta-da-serum': 'TA-DA.png',
  'duo-kit-the-one-i-love-facial-oil': 'DUO.png',
  'i-love-facial-oil': 'ILOVE.png',
  'facialoil': 'TheONE.png',
  'makeup-remover-au-naturel': 'Naturel.png',
  'fungtastic-extract': 'Fungtastic.png'
}

function parseProductsFromFile(filePath: string): ProductRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Split by double newlines to separate products
  const productBlocks = content.split('\n\n').filter(block => block.trim())
  
  const products: ProductRow[] = []
  
  for (const block of productBlocks) {
    const lines = block.split('\n').filter(line => line.trim())
    const currentProduct: Partial<ProductRow> = {}
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split('\t')
      const value = valueParts.join('\t').trim()
      
      if (key && key.trim()) {
        currentProduct[key.trim() as keyof ProductRow] = value
      }
    }
    
    if (Object.keys(currentProduct).length > 0) {
      products.push(currentProduct as ProductRow)
    }
  }
  
  return products
}

function parseSkinTypes(skinTypesStr: string): string[] {
  if (!skinTypesStr || skinTypesStr === '–') return []
  
  const typeMap: { [key: string]: string } = {
    'torr': 'dry',
    'fet': 'oily',
    'kombinerad': 'combination',
    'känslig': 'sensitive',
    'normal': 'normal',
    'inflammerad': 'sensitive',
    'mogen': 'mature'
  }
  
  const types: string[] = []
  const lowerStr = skinTypesStr.toLowerCase()
  
  Object.entries(typeMap).forEach(([swedish, english]) => {
    if (lowerStr.includes(swedish)) {
      if (!types.includes(english)) {
        types.push(english)
      }
    }
  })
  
  return types.length > 0 ? types : ['normal']
}

function generateCategoryId(categoryName: string): string {
  if (!categoryName) return 'unknown'
  return categoryName.toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function importProducts() {
  try {
    await connectDB()
    console.log('🔗 Connected to database')
    
    // Clear existing products
    await Product.deleteMany({})
    console.log('🗑️ Cleared existing products')
    
    const filePath = path.join(__dirname, '../../../frontend/public/1753_products_blocks.txt')
    const products = parseProductsFromFile(filePath)
    
    console.log(`📦 Found ${products.length} products to import`)
    
    for (const productData of products) {
      try {
        const slug = productData.Slug
        const imageName = imageMap[slug]
        
        // Build images array
        const images = []
        if (imageName) {
          images.push({
            url: `/images/products/${imageName}`,
            alt: productData['Bild 1 Alt-text'] || `${productData.Produktnamn} produktbild`,
            position: 1
          })
        }
        
        // Parse ingredients
        const ingredients = []
        if (productData['Ingrediens 1 namn']) {
          ingredients.push({
            name: productData['Ingrediens 1 namn'],
            description: productData['Ingrediens 1 beskrivning'] || '',
            benefits: productData['Ingrediens 1 fördelar'] ? 
              productData['Ingrediens 1 fördelar'].split(';').map(b => b.trim()) : [],
            concentration: productData['Ingrediens 1 koncentration'] || undefined
          })
        }
        
        // Parse price
        const priceStr = productData.Pris ? productData.Pris.replace(/[^\d]/g, '') : '0'
        const price = parseInt(priceStr) || 0
        
        // Parse tags
        const tags = productData.Taggar ? 
          productData.Taggar.split(',').map(tag => tag.trim()) : []
        
        // Parse benefits
        const benefits = productData.Fördelar ? 
          productData.Fördelar.split(';').map(benefit => benefit.trim()) : []
        
        // Parse SEO keywords
        const seoKeywords = productData['SEO-nyckelord'] ? 
          productData['SEO-nyckelord'].split(',').map(kw => kw.trim()) : []
        
        // Skip if missing required fields
        if (!productData.Produktnamn || !productData.Slug || !productData['Kort beskrivning'] || !productData['Lång beskrivning']) {
          console.log(`⚠️ Skipping product due to missing required fields: ${productData.Produktnamn || 'Unknown'}`)
          continue
        }
        
        // Ensure howToUse has a value
        if (!productData.Användning) {
          productData.Användning = 'Följ instruktioner på förpackningen'
        }

        // Create product
        const product = new Product({
          name: productData.Produktnamn,
          slug: productData.Slug,
          description: productData['Kort beskrivning'],
          longDescription: productData['Lång beskrivning'],
          price: price,
          images: images,
          variants: [], // Empty for now - avoid null SKU conflicts
          category: {
            id: generateCategoryId(productData.Kategorinamn),
            name: productData.Kategorinamn || 'Okategoriserad',
            slug: productData['Kategori-slug'] || 'okategoriserad'
          },
          tags: tags,
          ingredients: ingredients,
          skinTypes: parseSkinTypes(productData.Hudtyper),
          benefits: benefits,
          howToUse: productData.Användning || 'Följ instruktioner på förpackningen',
          featured: false,
          bestseller: false,
          newProduct: false,
          saleProduct: false,
          inventory: {
            quantity: 0, // Will be synced from 3PL
            sku: productData.SKU || `AUTO-${Date.now()}`,
            trackQuantity: productData['Spåra lager'] === 'Ja'
          },
          seo: {
            title: productData['SEO-titel'] || productData.Produktnamn,
            description: productData['SEO-beskrivning'] || productData['Kort beskrivning'],
            keywords: seoKeywords
          },
          status: 'active'
        })
        
        await product.save()
        console.log(`✅ Imported: ${productData.Produktnamn}`)
        
      } catch (error) {
        console.error(`❌ Error importing ${productData.Produktnamn}:`, error)
      }
    }
    
    console.log('🎉 Import completed!')
    
    // Show summary
    const totalProducts = await Product.countDocuments()
    console.log(`📊 Total products in database: ${totalProducts}`)
    
  } catch (error) {
    console.error('💥 Import failed:', error)
  } finally {
    process.exit(0)
  }
}

// Run the import
importProducts() 