import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import connectDB from '../config/database';
import { logger } from '../utils/logger';

interface JudgeMeCSVRow {
  title?: string;
  body: string;
  rating: string;
  review_date?: string;
  reviewer_name?: string;
  reviewer_email?: string;
  product_url?: string;
  product_id?: string;
  product_handle?: string;
  picture_urls?: string;
  reply?: string;
  reply_date?: string;
  ip_address?: string;
  // Custom fields från Judge.me
  'CF_Skin Type'?: string;
  'CF_Age Range'?: string;
  'CF_Usage Duration'?: string;
  'CF_Skin Concerns'?: string;
  'CF_Would Recommend'?: string;
}

interface JudgeMeAPIReview {
  id: string;
  title?: string;
  body: string;
  rating: number;
  created_at: string;
  updated_at?: string;
  reviewer: {
    name?: string;
    email?: string;
    location?: string;
  };
  product: {
    id: string;
    title: string;
    handle: string;
    url?: string;
  };
  pictures?: Array<{
    url: string;
    caption?: string;
  }>;
  reply?: {
    body: string;
    created_at: string;
  };
  custom_fields?: Record<string, any>;
  verified?: boolean;
  helpful_count?: number;
  published?: boolean;
}

class JudgeMeMigrator {
  private apiToken?: string;
  private shopDomain?: string;

  constructor(apiToken?: string, shopDomain?: string) {
    this.apiToken = apiToken;
    this.shopDomain = shopDomain;
  }

  /**
   * Migrate reviews from Judge.me CSV export
   */
  async migrateFromCSV(csvFilePath: string): Promise<void> {
    logger.info('Starting CSV migration from Judge.me', { csvFilePath });
    
    try {
      await connectDB();
      
      const reviews: JudgeMeCSVRow[] = [];
      
      // Read CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', (row: JudgeMeCSVRow) => {
            reviews.push(row);
          })
          .on('end', resolve)
          .on('error', reject);
      });

      logger.info(`Found ${reviews.length} reviews in CSV file`);

      let imported = 0;
      let skipped = 0;
      let errors = 0;

      for (const csvReview of reviews) {
        try {
          const review = await this.convertCSVReview(csvReview);
          if (review) {
            // Check for duplicates before saving
            const existingReview = await Review.findOne({
              productId: review.productId,
              body: review.body,
              rating: review.rating,
              'reviewer.email': review.reviewer.email
            });

            if (existingReview) {
              skipped++;
              logger.warn(`Duplicate review found, skipping`, { 
                body: review.body.substring(0, 50) + '...',
                email: review.reviewer.email 
              });
            } else {
              await review.save();
              imported++;
              logger.info(`Imported review ${imported}/${reviews.length}`);
            }
          } else {
            skipped++;
          }
        } catch (error) {
          errors++;
          logger.error('Error importing review:', error, { csvReview });
        }
      }

      logger.info('CSV migration completed', { 
        total: reviews.length, 
        imported, 
        skipped, 
        errors 
      });

    } catch (error) {
      logger.error('CSV migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate reviews from Judge.me API
   */
  async migrateFromAPI(): Promise<void> {
    if (!this.apiToken || !this.shopDomain) {
      throw new Error('API token and shop domain are required for API migration');
    }

    logger.info('Starting API migration from Judge.me', { 
      shopDomain: this.shopDomain 
    });

    try {
      await connectDB();

      let page = 1;
      let hasMore = true;
      let totalImported = 0;
      let totalErrors = 0;

      while (hasMore) {
        try {
          const response = await this.fetchReviewsFromAPI(page);
          const reviews = response.reviews || [];

          if (reviews.length === 0) {
            hasMore = false;
            break;
          }

          for (const apiReview of reviews) {
            try {
              const review = await this.convertAPIReview(apiReview);
              if (review) {
                await review.save();
                totalImported++;
                logger.info(`Imported review ${totalImported} (Page ${page})`);
              }
            } catch (error) {
              totalErrors++;
              logger.error('Error importing API review:', error, { 
                reviewId: apiReview.id 
              });
            }
          }

          page++;
          
          // Rate limiting - Judge.me typically allows 60 requests/minute
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          logger.error(`Error fetching page ${page}:`, error);
          hasMore = false;
        }
      }

      logger.info('API migration completed', { 
        totalImported, 
        totalErrors,
        pages: page - 1
      });

    } catch (error) {
      logger.error('API migration failed:', error);
      throw error;
    }
  }

  /**
   * Convert CSV row to Review model
   */
  private async convertCSVReview(csvReview: JudgeMeCSVRow): Promise<any> {
    try {
      // Find product by URL, ID, or handle
      const product = await this.findProductByIdentifier(
        csvReview.product_url,
        csvReview.product_id,
        csvReview.product_handle
      );

      if (!product) {
        logger.warn('Product not found for review, skipping', { 
          product_url: csvReview.product_url,
          product_id: csvReview.product_id,
          product_handle: csvReview.product_handle
        });
        return null;
      }

      // Parse rating
      const rating = parseInt(csvReview.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        logger.warn('Invalid rating, skipping review', { rating: csvReview.rating });
        return null;
      }

      // Parse review date
      let reviewDate = new Date();
      if (csvReview.review_date) {
        const parsed = this.parseDate(csvReview.review_date);
        if (parsed) reviewDate = parsed;
      }

      // Parse photos
      const photos = this.parsePhotoUrls(csvReview.picture_urls);

      // Extract custom fields for skincare metadata
      const metadata = this.extractSkincareMetadata(csvReview);

      // Create review object matching the model structure
      const reviewData = {
        productId: product._id,
        userId: 'migrated-user', // Placeholder for migrated reviews
        rating,
        title: csvReview.title || 'Review',
        body: csvReview.body,
        reviewer: {
          name: csvReview.reviewer_name || 'Anonymous',
          email: csvReview.reviewer_email || '',
          isVerified: false
        },
        isVerifiedPurchase: false, // CSV imports are not verified by default
        photos: photos.map(photo => ({
          url: photo.url,
          alt: photo.caption,
          uploadedAt: reviewDate
        })),
        helpfulVotes: 0,
        reportedCount: 0,
        status: 'approved' as const, // Assume existing Judge.me reviews were approved
        replies: [] as any[],
        metadata: {
          skinType: metadata.skinType,
          ageRange: metadata.ageRange,
          usageDuration: metadata.usageDuration,
          skinConcerns: metadata.skinConcerns
        },
        dripData: {
          workflowTriggered: false
        },
        createdAt: reviewDate,
        updatedAt: reviewDate
      };

      // Add reply if exists
      if (csvReview.reply) {
        reviewData.replies.push({
          authorType: 'admin' as const,
          authorName: 'Store Owner',
          body: csvReview.reply,
          createdAt: csvReview.reply_date ? 
            this.parseDate(csvReview.reply_date) || new Date() : 
            new Date()
        });
      }

      return new Review(reviewData);

    } catch (error) {
      logger.error('Error converting CSV review:', error, { csvReview });
      throw error;
    }
  }

  /**
   * Convert API response to Review model
   */
  private async convertAPIReview(apiReview: JudgeMeAPIReview): Promise<any> {
    try {
      // Find product by Judge.me product ID or handle
      const product = await this.findProductByIdentifier(
        apiReview.product.url,
        apiReview.product.id,
        apiReview.product.handle
      );

      if (!product) {
        logger.warn('Product not found for API review, skipping', { 
          productId: apiReview.product.id,
          productHandle: apiReview.product.handle
        });
        return null;
      }

      // Parse photos from API
      const photos = apiReview.pictures?.map(pic => ({
        url: pic.url,
        caption: pic.caption || ''
      })) || [];

      // Extract metadata from custom fields
      const metadata = this.extractSkincareMetadataFromAPI(apiReview.custom_fields);

      const reviewData = {
        productId: product._id,
        userId: 'migrated-user',
        rating: apiReview.rating,
        title: apiReview.title || '',
        body: apiReview.body,
        reviewer: {
          name: apiReview.reviewer.name || 'Anonymous',
          email: apiReview.reviewer.email || '',
          isVerified: apiReview.verified || false
        },
        isVerifiedPurchase: apiReview.verified || false,
        photos: photos.map(photo => ({
          url: photo.url,
          alt: photo.caption || '',
          uploadedAt: new Date(apiReview.created_at)
        })),
        helpfulVotes: apiReview.helpful_count || 0,
        reportedCount: 0,
        status: (apiReview.published ? 'approved' : 'pending') as const,
        replies: [] as any[],
        metadata: {
          skinType: metadata.skinType,
          ageRange: metadata.ageRange,
          usageDuration: metadata.usageDuration,
          skinConcerns: metadata.skinConcerns
        },
        dripData: {
          workflowTriggered: false
        },
        createdAt: new Date(apiReview.created_at),
        updatedAt: new Date(apiReview.updated_at || apiReview.created_at)
      };

      // Add reply if exists
      if (apiReview.reply) {
        reviewData.replies.push({
          authorType: 'admin' as const,
          authorName: 'Store Owner',
          body: apiReview.reply.body,
          createdAt: new Date(apiReview.reply.created_at)
        });
      }

      return new Review(reviewData);

    } catch (error) {
      logger.error('Error converting API review:', error, { reviewId: apiReview.id });
      throw error;
    }
  }

  /**
   * Fetch reviews from Judge.me API
   */
  private async fetchReviewsFromAPI(page: number = 1): Promise<any> {
    const url = `https://judge.me/api/v1/reviews?shop_domain=${this.shopDomain}&page=${page}&per_page=100`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Judge.me API error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create a mapping for Judge.me handles to our product names
   */
  private createProductMapping(): Record<string, string> {
    return {
      // Main products
      'facialoil': 'I LOVE Facial Oil',
      'facial-oil': 'I LOVE Facial Oil', 
      'i-love-facial-oil': 'I LOVE Facial Oil',
      'the-one-facial-oil': 'The ONE Facial Oil',
      'makeup-remover-au-naturel': 'Au Naturel Makeup Remover',
      'au-naturel-makeup-remover': 'Au Naturel Makeup Remover',
      'fungtastic-extract': 'Fungtastic Mushroom Extract',
      'fungtastic-mushroom-extract': 'Fungtastic Mushroom Extract',
      'ta-da-serum': 'TA-DA Serum',
      
      // Bundle packages
      'duo-kit-the-one-i-love-facial-oil': 'DUO-kit (The ONE + I LOVE Facial Oil)',
      'duo-kit': 'DUO-kit (The ONE + I LOVE Facial Oil)',
      'duo-ta-da': 'DUO-kit + TA-DA Serum',
      
      // Special packages/campaigns - map to correct products
      'arets-cannabinoid-julpaket-2023': 'DUO-kit + TA-DA Serum', // Christmas package same as duo-ta-da
      'mellandagsrea-2024': 'I LOVE Facial Oil', // After Christmas sale
      'arets-black-week-kampanj': 'I LOVE Facial Oil', // Black week campaign
      'torr-hud': 'I LOVE Facial Oil' // Dry skin special
    };
  }

  /**
   * Find product by various identifiers
   */
  private async findProductByIdentifier(
    productUrl?: string, 
    productId?: string,
    productHandle?: string
  ): Promise<any> {
    const productMapping = this.createProductMapping();
    
    // First try to find by mapped handle
    if (productHandle && productMapping[productHandle]) {
      const mappedName = productMapping[productHandle];
      const product = await Product.findOne({ name: mappedName });
      if (product) {
        logger.info(`Found product by handle mapping: ${productHandle} -> ${mappedName}`);
        return product;
      }
    }

    // Try to extract handle from URL
    if (productUrl) {
      const urlMatch = productUrl.match(/\/products\/([^/?]+)/);
      if (urlMatch) {
        const handle = urlMatch[1];
        if (productMapping[handle]) {
          const mappedName = productMapping[handle];
          const product = await Product.findOne({ name: mappedName });
          if (product) {
            logger.info(`Found product by URL handle mapping: ${handle} -> ${mappedName}`);
            return product;
          }
        }
        
        // Try direct handle match
        const product = await Product.findOne({ handle });
        if (product) return product;
      }
    }

    // Try by product handle directly
    if (productHandle) {
      const product = await Product.findOne({ handle: productHandle });
      if (product) return product;
    }

    // Try by external ID (if stored)
    if (productId) {
      const product = await Product.findOne({ 
        $or: [
          { shopifyId: productId },
          { externalId: productId }
        ]
      });
      if (product) return product;
    }

    // As a last resort, try fuzzy matching on product names
    if (productHandle) {
      const fuzzyPatterns = [
        productHandle.replace(/-/g, ' '),
        productHandle.replace(/-/g, '').toLowerCase(),
        productHandle.toUpperCase()
      ];
      
      for (const pattern of fuzzyPatterns) {
        const product = await Product.findOne({ 
          name: { $regex: pattern, $options: 'i' } 
        });
        if (product) {
          logger.info(`Found product by fuzzy matching: ${productHandle} -> ${product.name}`);
          return product;
        }
      }
    }

    return null;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateString: string): Date | null {
    // Try DD/MM/YYYY format first (Judge.me default)
    const ddmmyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Try ISO format
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    return null;
  }

  /**
   * Parse photo URLs from comma-separated string
   */
  private parsePhotoUrls(photoString?: string): Array<{url: string, caption: string}> {
    if (!photoString) return [];

    return photoString
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .map(url => ({ url, caption: '' }));
  }

  /**
   * Extract skincare metadata from CSV custom fields
   */
  private extractSkincareMetadata(csvReview: JudgeMeCSVRow): any {
    const metadata: any = {};

    if (csvReview['CF_Skin Type']) {
      metadata.skinType = csvReview['CF_Skin Type'].toLowerCase();
    }

    if (csvReview['CF_Age Range']) {
      metadata.ageRange = csvReview['CF_Age Range'];
    }

    if (csvReview['CF_Usage Duration']) {
      metadata.usageDuration = csvReview['CF_Usage Duration'];
    }

    if (csvReview['CF_Skin Concerns']) {
      metadata.skinConcerns = csvReview['CF_Skin Concerns']
        .split(',')
        .map(concern => concern.trim().toLowerCase());
    }

    if (csvReview['CF_Would Recommend']) {
      metadata.wouldRecommend = csvReview['CF_Would Recommend'].toLowerCase() === 'yes';
    }

    return metadata;
  }

  /**
   * Extract skincare metadata from API custom fields
   */
  private extractSkincareMetadataFromAPI(customFields?: Record<string, any>): any {
    if (!customFields) return {};

    const metadata: any = {};

    // Map common custom field names to our metadata structure
    const fieldMappings = {
      'skin_type': 'skinType',
      'age_range': 'ageRange', 
      'usage_duration': 'usageDuration',
      'skin_concerns': 'skinConcerns',
      'would_recommend': 'wouldRecommend'
    };

    for (const [apiField, metaField] of Object.entries(fieldMappings)) {
      if (customFields[apiField]) {
        if (metaField === 'skinConcerns' && typeof customFields[apiField] === 'string') {
          metadata[metaField] = customFields[apiField]
            .split(',')
            .map(concern => concern.trim().toLowerCase());
        } else if (metaField === 'wouldRecommend') {
          metadata[metaField] = customFields[apiField] === 'yes' || customFields[apiField] === true;
        } else {
          metadata[metaField] = customFields[apiField];
        }
      }
    }

    return metadata;
  }

  /**
   * Generate migration statistics
   */
  async generateMigrationReport(): Promise<void> {
    const totalReviews = await Review.countDocuments();
    const judgeReviews = await Review.countDocuments({ 
      source: { $in: ['judge.me_csv', 'judge.me_api'] } 
    });
    
    const stats = await Review.aggregate([
      { $match: { source: { $in: ['judge.me_csv', 'judge.me_api'] } } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          withPhotos: { 
            $sum: { 
              $cond: [{ $gt: [{ $size: '$photos' }, 0] }, 1, 0] 
            } 
          },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      }
    ]);

    logger.info('Migration Report Generated', {
      totalReviews,
      judgeReviews,
      migrationStats: stats
    });

    console.log('\n=== JUDGEME MIGRATION REPORT ===');
    console.log(`Total reviews in database: ${totalReviews}`);
    console.log(`Reviews migrated from Judge.me: ${judgeReviews}`);
    console.log('\nDetailed statistics:');
    
    stats.forEach(stat => {
      console.log(`\n${stat._id.toUpperCase()}:`);
      console.log(`  Count: ${stat.count}`);
      console.log(`  Average rating: ${stat.avgRating.toFixed(2)}`);
      console.log(`  With photos: ${stat.withPhotos}`);
      console.log(`  Verified: ${stat.verified}`);
    });
    
    console.log('\n================================\n');
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'csv': {
        const csvPath = args[1];
        if (!csvPath) {
          console.error('Usage: npm run migrate:judgeme csv <path-to-csv-file>');
          process.exit(1);
        }
        
        const migrator = new JudgeMeMigrator();
        await migrator.migrateFromCSV(csvPath);
        await migrator.generateMigrationReport();
        break;
      }

      case 'api': {
        const apiToken = process.env.JUDGEME_API_TOKEN;
        const shopDomain = process.env.JUDGEME_SHOP_DOMAIN;
        
        if (!apiToken || !shopDomain) {
          console.error('API migration requires JUDGEME_API_TOKEN and JUDGEME_SHOP_DOMAIN environment variables');
          process.exit(1);
        }

        const migrator = new JudgeMeMigrator(apiToken, shopDomain);
        await migrator.migrateFromAPI();
        await migrator.generateMigrationReport();
        break;
      }

      case 'report': {
        const migrator = new JudgeMeMigrator();
        await connectDB();
        await migrator.generateMigrationReport();
        break;
      }

      default:
        console.log('Usage:');
        console.log('  npm run migrate:judgeme csv <path-to-csv-file>');
        console.log('  npm run migrate:judgeme api');
        console.log('  npm run migrate:judgeme report');
        console.log('');
        console.log('For API migration, set environment variables:');
        console.log('  JUDGEME_API_TOKEN=your_token');
        console.log('  JUDGEME_SHOP_DOMAIN=your_shop.myshopify.com');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { JudgeMeMigrator }; 