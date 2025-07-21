import { prisma } from '../src/lib/prisma'

async function main() {
  const updated = await prisma.review.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'APPROVED' }
  })
  console.log(`✅ Uppdaterade ${updated.count} recensioner till APPROVED`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 