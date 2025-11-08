import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestDiscount() {
  try {
    const code = 'TEST1234'
    
    // Check if code already exists
    const existing = await prisma.discountCode.findUnique({
      where: { code }
    })

    if (existing) {
      console.log(`⚠️  Rabattkod "${code}" finns redan!`)
      console.log('Uppdaterar den istället...')
      
      const updated = await prisma.discountCode.update({
        where: { code },
        data: {
          name: 'Test Rabattkod - 99%',
          description: 'Testrabatt för betalningsfunktion',
          type: 'percentage',
          value: 99,
          isActive: true,
          isPublic: true,
          usageLimit: null, // Obegränsat för testning
          perCustomerLimit: null,
          validFrom: new Date(),
          validUntil: null, // Ingen utgångsdatum
          minimumOrderAmount: null,
          maximumDiscount: null,
          applicableToAll: true,
          notes: 'Skapad för testning av betalningsfunktion'
        }
      })
      
      console.log('✅ Rabattkod uppdaterad!')
      console.log(`   Kod: ${updated.code}`)
      console.log(`   Typ: ${updated.type}`)
      console.log(`   Värde: ${updated.value}%`)
      console.log(`   Status: ${updated.isActive ? 'Aktiv' : 'Inaktiv'}`)
      return
    }

    // Create new discount code
    const discountCode = await prisma.discountCode.create({
      data: {
        code: code,
        name: 'Test Rabattkod - 99%',
        description: 'Testrabatt för betalningsfunktion',
        type: 'percentage',
        value: 99, // 99% rabatt
        isActive: true,
        isPublic: true,
        usageLimit: null, // Obegränsat för testning
        perCustomerLimit: null,
        validFrom: new Date(),
        validUntil: null, // Ingen utgångsdatum
        minimumOrderAmount: null, // Ingen minimibelopp
        maximumDiscount: null, // Ingen maxrabatt
        applicableToAll: true, // Gäller alla produkter
        notes: 'Skapad för testning av betalningsfunktion'
      }
    })

    console.log('✅ Rabattkod skapad!')
    console.log(`   Kod: ${discountCode.code}`)
    console.log(`   Typ: ${discountCode.type}`)
    console.log(`   Värde: ${discountCode.value}%`)
    console.log(`   Status: ${discountCode.isActive ? 'Aktiv' : 'Inaktiv'}`)
    console.log(`   Användningsräknare: ${discountCode.usageCount}`)
    console.log('')
    console.log('💡 Använd denna kod i checkout för att testa betalningsfunktionen!')

  } catch (error) {
    console.error('❌ Fel vid skapande av rabattkod:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createTestDiscount()
  .then(() => {
    console.log('')
    console.log('✨ Klart!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script misslyckades:', error)
    process.exit(1)
  })

