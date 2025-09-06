import { PrismaClient } from '@prisma/client'
import { fortnoxService } from '../src/services/fortnoxService'
import { ongoingService } from '../src/services/ongoingService'
import { logger } from '../src/utils/logger'

const prisma = new PrismaClient()

interface FortnoxArticle {
  ArticleNumber: string
  Description: string
  SalesPrice?: number
  PurchasePrice?: number
  Weight?: number
  Unit?: string
  StockGoods?: boolean
}

async function syncFortnoxProductsToOngoing() {
  try {
    logger.info('Starting sync of products from Fortnox to Ongoing')

    // 1. Get all products from our database (which should match Fortnox)
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        weight: true,
        dimensions: true
      }
    })

    logger.info(`Found ${products.length} products to sync`)

    let successCount = 0
    let errorCount = 0

    // 2. Sync each product to Ongoing
    for (const product of products) {
      try {
        logger.info(`Syncing product: ${product.sku} - ${product.name}`)

        // Parse dimensions if available
        const dimensions = product.dimensions as any || {}
        
        const ongoingArticle = {
          ArticleNumber: product.sku || product.id,
          ArticleName: product.name,
          ProductCode: product.sku || product.id,
          BarCode: product.sku || product.id,
          Weight: product.weight || 0,
          Length: dimensions.length || 0,
          Width: dimensions.width || 0,
          Height: dimensions.height || 0,
          Price: product.price,
          PurchasePrice: product.price * 0.6, // Estimate 60% of sales price
          ArticleGroupCode: 'SKINCARE',
          ArticleUnitCode: 'ST'
        }

        await ongoingService.createArticle(ongoingArticle)
        successCount++
        logger.info(`✅ Product synced: ${product.sku}`)

        // Rate limiting - wait 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error: any) {
        errorCount++
        logger.error(`❌ Failed to sync product ${product.sku}:`, error.message)
      }
    }

    logger.info(`Product sync completed: ${successCount} success, ${errorCount} errors`)

  } catch (error) {
    logger.error('Product sync failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  syncFortnoxProductsToOngoing()
} 