import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const prisma = new PrismaClient();

interface CSVReview {
  'id': string;
  'shop_domain': string;
  'platform': string;
  'product_handle': string;
  'product_title': string;
  'product_id': string;
  'rating': string;
  'title': string;
  'body': string;
  'reviewer_email': string;
  'reviewer_name': string;
  'reviewer_phone': string;
  'verified': string;
  'created_at': string;
  'updated_at': string;
  'pictures': string;
}

// Product mapping from Judge.me product handles to our new product slugs
const productMapping: Record<string, string> = {
  'i-love-facial-oil': 'i-love-facial-oil',
  'duo-kit-ta-da-serum': 'duo-kit-ta-da-serum',
  'duo-kit-the-one-i-love-facial-oil': 'duo-kit-the-one-i-love',
  'au-naturel-makeup-remover': 'au-naturel-makeup-remover',
  'makeup-remover-au-naturel': 'au-naturel-makeup-remover',
  'fungtastic-mushroom-extract': 'fungtastic-mushroom-extract',
  'fungtastic-extract': 'fungtastic-mushroom-extract',
  'ta-da-serum': 'ta-da-serum',
  'the-one-facial-oil': 'the-one-facial-oil',
  'facialoil': 'the-one-facial-oil',  // Based on analysis, facialoil = The ONE
  'duo-ta-da': 'duo-kit-ta-da-serum',
  
  // Store reviews
  'store-reviews': 'store-reviews',
  'all-reviews-page': 'store-reviews',
  'multi-review': 'store-reviews',
  
  // Campaign products - all point to DUO + TA-DA
  'arets-black-week-kampanj': 'duo-kit-ta-da-serum',
  'arets-cannabinoid-julpaket-2023': 'duo-kit-ta-da-serum',
  'mellandagsrea-2024': 'duo-kit-ta-da-serum'
};

// Function to intelligently map reviews without product_handle to products
function mapReviewToProduct(csvReview: CSVReview): string | null {
  const title = csvReview.title?.toLowerCase() || '';
  const body = csvReview.body?.toLowerCase() || '';
  const reviewText = (title + ' ' + body).toLowerCase();
  
  // Check for store/service related reviews
  if (reviewText.includes('kundservice') || reviewText.includes('leverans') || 
      reviewText.includes('snabb leverans') || reviewText.includes('bra service') ||
      reviewText.includes('butik') || reviewText.includes('hemsida') ||
      reviewText.includes('beställning') || reviewText.includes('support') ||
      reviewText.includes('företag') || reviewText.includes('1753') ||
      (reviewText.includes('bra') && reviewText.includes('service'))) {
    return 'store-reviews';
  }
  
  // Check for specific product mentions
  if (reviewText.includes('the one') || reviewText.includes('theone')) {
    return 'the-one-facial-oil';
  }
  
  if (reviewText.includes('i love') || reviewText.includes('ilove')) {
    return 'i-love-facial-oil';
  }
  
  if (reviewText.includes('duo') && (reviewText.includes('ta-da') || reviewText.includes('tada') || reviewText.includes('serum'))) {
    return 'duo-kit-ta-da-serum';
  }
  
  if (reviewText.includes('duo') && !reviewText.includes('ta-da') && !reviewText.includes('serum')) {
    return 'duo-kit-the-one-i-love';
  }
  
  if (reviewText.includes('fungtastic') || reviewText.includes('mushroom') || reviewText.includes('svamp')) {
    return 'fungtastic-mushroom-extract';
  }
  
  if (reviewText.includes('au naturel') || reviewText.includes('makeup') || reviewText.includes('remover')) {
    return 'au-naturel-makeup-remover';
  }
  
  if (reviewText.includes('ta-da') || reviewText.includes('tada') || reviewText.includes('serum')) {
    return 'ta-da-serum';
  }
  
  // For generic facial oil reviews, use date-based logic
  if (reviewText.includes('olja') || reviewText.includes('facial') || reviewText.includes('ansikt')) {
    const reviewDate = new Date(csvReview.created_at || '2022-01-01');
    const cutoffDate = new Date('2023-01-01');
    
    // Also consider rating - higher ratings tend to be The ONE based on feedback
    const rating = parseInt(csvReview.rating) || 5;
    
    if (reviewDate < cutoffDate || rating === 5) {
      return 'the-one-facial-oil';  // Earlier reviews or 5-star = The ONE
    } else {
      return 'i-love-facial-oil';   // Later reviews or lower rating = I LOVE
    }
  }
  
  // For completely generic reviews, distribute based on date
  const reviewDate = new Date(csvReview.created_at || '2022-01-01');
  const cutoffDate = new Date('2022-06-01');  // Mid-2022 cutoff
  
  return reviewDate < cutoffDate ? 'the-one-facial-oil' : 'i-love-facial-oil';
}

async function importReviewsFromCSV() {
  try {
    console.log('🔗 Connecting to PostgreSQL...');
    
    // Clear existing reviews
    console.log('🗑️ Clearing existing reviews...');
    await prisma.review.deleteMany();
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), '..', 'frontend', 'public', 'reviews2025.csv');
    console.log(`📄 Reading CSV file: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    const reviews: CSVReview[] = [];
    
    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data: CSVReview) => {
          reviews.push(data);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    console.log(`📊 Found ${reviews.length} reviews in CSV`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const csvReview of reviews) {
      try {
        // Map product handle to slug, or use intelligent mapping for missing handles
        let productSlug = productMapping[csvReview.product_handle];
        
        // If no product handle, try intelligent mapping based on review content
        if (!productSlug && (!csvReview.product_handle || csvReview.product_handle === '')) {
          productSlug = mapReviewToProduct(csvReview);
          if (productSlug) {
            console.log(`🧠 Mapped review to ${productSlug} based on content: "${csvReview.title?.substring(0, 50)}..."`);
          }
        }
        
        if (!productSlug) {
          console.log(`⚠️ Skipping review - unknown product handle: ${csvReview.product_handle}`);
          skipped++;
          continue;
        }
        
        // Find product in database
        const product = await prisma.product.findUnique({
          where: { slug: productSlug }
        });
        
        if (!product) {
          console.log(`⚠️ Skipping review - product not found: ${productSlug}`);
          skipped++;
          continue;
        }
        
        // Parse and validate data
        const rating = parseInt(csvReview.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          console.log(`⚠️ Skipping review - invalid rating: ${csvReview.rating}`);
          skipped++;
          continue;
        }
        
        // Create review
        const review = await prisma.review.create({
          data: {
            productId: product.id,
            rating: rating,
            title: csvReview.title || `${rating}-stjärnig recension`,
            body: csvReview.body || '',
            reviewerName: csvReview.reviewer_name || 'Anonym',
            reviewerEmail: csvReview.reviewer_email || '',
            isVerified: csvReview.verified === 'true' || csvReview.verified === '1',
            status: 'APPROVED',
            source: 'judge.me_csv',
            externalId: csvReview.id,
            
            // Timestamps
            createdAt: csvReview.created_at ? new Date(csvReview.created_at) : new Date(),
            updatedAt: csvReview.updated_at ? new Date(csvReview.updated_at) : new Date(),
          }
        });
        
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`📈 Progress: ${imported} reviews imported...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to import review ${csvReview.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`🎉 Import completed!`);
    console.log(`✅ Reviews imported: ${imported}`);
    console.log(`⚠️ Reviews skipped: ${skipped}`);
    
    // Show summary by product
    const reviewCounts = await prisma.review.groupBy({
      by: ['productId'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 Reviews per product:');
    for (const count of reviewCounts) {
      const product = await prisma.product.findUnique({
        where: { id: count.productId },
        select: { name: true }
      });
      console.log(`   ${product?.name}: ${count._count.id} reviews`);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importReviewsFromCSV(); 