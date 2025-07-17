import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductStats {
  id: string;
  name: string;
  slug: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

async function calculateProductAverages() {
  try {
    console.log('🔢 Calculating average ratings for all products...\n');

    // Get all products with their reviews
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        reviews: {
          where: {
            status: 'APPROVED'
          },
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const productStats: ProductStats[] = [];

    for (const product of products) {
      const reviews = product.reviews;
      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        productStats.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
        continue;
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      // Calculate rating distribution
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      productStats.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingDistribution
      });
    }

    // Sort by average rating (highest first)
    productStats.sort((a, b) => b.averageRating - a.averageRating);

    // Display results
    console.log('📊 SNITTBETYG PER PRODUKT:');
    console.log('=' + '='.repeat(80));
    console.log('Produkt'.padEnd(30) + 'Antal'.padEnd(8) + 'Snitt'.padEnd(8) + 'Distribution (1-5 ⭐)');
    console.log('-'.repeat(80));

    let totalReviewsAll = 0;
    let totalRatingSum = 0;

    for (const stats of productStats) {
      const distributionText = Object.entries(stats.ratingDistribution)
        .map(([rating, count]) => `${rating}:${count}`)
        .join(' ');

      console.log(
        `${stats.name.padEnd(30)}${stats.totalReviews.toString().padEnd(8)}${stats.averageRating.toFixed(1).padEnd(8)}${distributionText}`
      );

      totalReviewsAll += stats.totalReviews;
      totalRatingSum += stats.averageRating * stats.totalReviews;
    }

    // Overall statistics
    const overallAverage = totalReviewsAll > 0 ? totalRatingSum / totalReviewsAll : 0;

    console.log('-'.repeat(80));
    console.log(`TOTALT: ${totalReviewsAll} recensioner, snittbetyg: ${overallAverage.toFixed(2)} ⭐`);
    console.log('=' + '='.repeat(80));

    // Additional insights
    console.log('\n💡 INSIGHTS:');
    const productsWithReviews = productStats.filter(p => p.totalReviews > 0);
    const topRated = productsWithReviews.filter(p => p.averageRating >= 4.5);
    const needImprovement = productsWithReviews.filter(p => p.averageRating < 3.5);

    console.log(`• Produkter med recensioner: ${productsWithReviews.length}/${productStats.length}`);
    console.log(`• Toppbetyg (≥4.5⭐): ${topRated.length} produkter`);
    console.log(`• Behöver förbättring (<3.5⭐): ${needImprovement.length} produkter`);

    if (topRated.length > 0) {
      console.log('\n🏆 TOPPBETYG:');
      topRated.forEach(product => {
        console.log(`   ${product.name}: ${product.averageRating}⭐ (${product.totalReviews} recensioner)`);
      });
    }

    if (needImprovement.length > 0) {
      console.log('\n⚠️ BEHÖVER FÖRBÄTTRING:');
      needImprovement.forEach(product => {
        console.log(`   ${product.name}: ${product.averageRating}⭐ (${product.totalReviews} recensioner)`);
      });
    }

    // Most reviewed products
    const mostReviewed = [...productStats]
      .filter(p => p.totalReviews > 0)
      .sort((a, b) => b.totalReviews - a.totalReviews)
      .slice(0, 5);

    if (mostReviewed.length > 0) {
      console.log('\n📈 MEST RECENSERADE:');
      mostReviewed.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}: ${product.totalReviews} recensioner (${product.averageRating}⭐)`);
      });
    }

  } catch (error) {
    console.error('❌ Error calculating averages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  calculateProductAverages();
}

export { calculateProductAverages }; 