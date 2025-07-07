import { Product } from '../models/Product'
import connectDB from '../config/database'

async function updateFeaturedProducts() {
  try {
    await connectDB()
    console.log('🔗 Connected to database')
    
    // Update specific products to be featured
    const featuredSlugs = [
      'duo-ta-da',
      'ta-da-serum', 
      'i-love-facial-oil',
      'facialoil'
    ]
    
    // Set featured to true for selected products
    const result = await Product.updateMany(
      { slug: { $in: featuredSlugs } },
      { $set: { featured: true } }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} products to be featured`)
    
    // Also set some as bestsellers
    const bestsellerSlugs = ['duo-ta-da', 'ta-da-serum']
    await Product.updateMany(
      { slug: { $in: bestsellerSlugs } },
      { $set: { bestseller: true } }
    )
    
    console.log(`✅ Updated ${bestsellerSlugs.length} products to be bestsellers`)
    
    // Show featured products
    const featuredProducts = await Product.find({ featured: true }).select('name slug featured bestseller')
    console.log('📋 Featured products:')
    featuredProducts.forEach(p => {
      console.log(`  - ${p.name} (${p.slug}) - Bestseller: ${p.bestseller}`)
    })
    
  } catch (error) {
    console.error('💥 Update failed:', error)
  } finally {
    process.exit(0)
  }
}

// Run the update
updateFeaturedProducts() 