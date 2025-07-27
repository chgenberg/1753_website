import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateSpecificProductPrices() {
  try {
    console.log('💰 Updating specific product prices...\n')

    // Update regular DUO-kit to 1099 kr
    const duoKitRegularUpdate = await prisma.product.updateMany({
      where: {
        slug: 'duo-kit-the-one-i-love'
      },
      data: {
        price: 1099,
        compareAtPrice: null
      }
    })

    console.log(`✅ Updated ${duoKitRegularUpdate.count} regular DUO-kit products to 1099 kr`)

    // Update DUO-kit + TA-DA to 1498 kr
    const duoKitTadaUpdate = await prisma.product.updateMany({
      where: {
        slug: 'duo-kit-ta-da-serum'
      },
      data: {
        price: 1498,
        compareAtPrice: null
      }
    })

    console.log(`✅ Updated ${duoKitTadaUpdate.count} DUO-kit + TA-DA products to 1498 kr`)

    // Update Fungtastic Mushroom Extract to regular price
    const fungtasticUpdate = await prisma.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'Fungtastic', mode: 'insensitive' } },
          { name: { contains: 'Mushroom', mode: 'insensitive' } },
          { slug: { contains: 'fungtastic' } }
        ]
      },
      data: {
        price: 399,
        compareAtPrice: null // Remove any compare price to make it regular price
      }
    })

    console.log(`✅ Updated ${fungtasticUpdate.count} Fungtastic products to 399 kr (regular price)`)

    // Show updated products
    const updatedProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'DUO', mode: 'insensitive' } },
          { name: { contains: 'Fungtastic', mode: 'insensitive' } },
          { name: { contains: 'Mushroom', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true
      }
    })

    console.log('\n📦 Updated products:')
    updatedProducts.forEach(product => {
      const priceDisplay = product.compareAtPrice 
        ? `${product.price} kr (was ${product.compareAtPrice} kr)` 
        : `${product.price} kr (regular price)`
      
      console.log(`   ${product.name}`)
      console.log(`      Slug: ${product.slug}`)
      console.log(`      Price: ${priceDisplay}\n`)
    })

    console.log('✅ Price updates completed!')

  } catch (error) {
    console.error('❌ Error updating prices:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSpecificProductPrices() 