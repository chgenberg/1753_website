import { prisma } from '../src/lib/prisma'

async function main() {
  const counts = await prisma.review.groupBy({
    by: ['status'],
    _count: true
  })
  console.table(counts.map(c=>({status:c.status, count:c._count})))
  await prisma.$disconnect()
}
main() 