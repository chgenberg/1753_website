import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRelatedProducts() {
  try {
    console.log('🔄 Testing related products functionality...');
    
    // Test with TA-DA Serum
    const testSlug = 'ta-da-serum';
    
    // Get the current product
    const currentProduct = await prisma.product.findUnique({
      where: { slug: testSlug, isActive: true }
    });
    
    if (!currentProduct) {
      console.log('❌ Test product not found');
      return;
    }
    
    console.log(`📦 Testing with: ${currentProduct.name}`);
    console.log(`   Category: ${currentProduct.category}`);
    console.log(`   Skin types: ${currentProduct.skinTypes.join(', ')}`);
    console.log(`   Key ingredients: ${currentProduct.keyIngredients.join(', ')}`);
    console.log(`   Tags: ${currentProduct.tags.join(', ')}`);
    
    // Get all other products for scoring
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: currentProduct.id }
      }
    });
    
    console.log(`\n🔍 Found ${allProducts.length} other products to compare`);
    
    // Score products
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      let reasons = [];
      
      // Category match
      if (currentProduct.category && product.category === currentProduct.category) {
        score += 50;
        reasons.push(`Same category (${product.category})`);
      }
      
      // Skin types overlap
      const currentSkinTypes = currentProduct.skinTypes || [];
      const productSkinTypes = product.skinTypes || [];
      const skinTypeOverlap = currentSkinTypes.filter(type => productSkinTypes.includes(type)).length;
      if (skinTypeOverlap > 0) {
        score += skinTypeOverlap * 15;
        reasons.push(`${skinTypeOverlap} matching skin types`);
      }
      
      // Key ingredients overlap
      const currentIngredients = currentProduct.keyIngredients || [];
      const productIngredients = product.keyIngredients || [];
      const ingredientsOverlap = currentIngredients.filter(ing => productIngredients.includes(ing)).length;
      if (ingredientsOverlap > 0) {
        score += ingredientsOverlap * 8;
        reasons.push(`${ingredientsOverlap} matching ingredients`);
      }
      
      // Tags overlap
      const currentTags = currentProduct.tags || [];
      const productTags = product.tags || [];
      const tagsOverlap = currentTags.filter(tag => productTags.includes(tag)).length;
      if (tagsOverlap > 0) {
        score += tagsOverlap * 5;
        reasons.push(`${tagsOverlap} matching tags`);
      }
      
      // Price similarity
      const priceDiff = Math.abs(currentProduct.price - product.price);
      if (priceDiff <= 200) {
        score += 10;
        reasons.push('Similar price range');
      }
      
      return {
        name: product.name,
        score,
        reasons: reasons.join(', ') || 'No specific matches'
      };
    });
    
    // Sort and show top 5
    const topProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    console.log('\n🏆 Top related products:');
    topProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (Score: ${product.score})`);
      console.log(`   Reasons: ${product.reasons}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRelatedProducts(); 