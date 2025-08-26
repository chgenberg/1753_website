import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SubscriptionPlanData {
  name: string
  description: string
  price: number
  interval: 'monthly' | 'quarterly' | 'yearly'
  intervalCount: number
  trialDays: number
  features: string[]
}

const subscriptionPlans: SubscriptionPlanData[] = [
  {
    name: 'Månadsbox - Upptäck',
    description: 'Perfekt för dig som vill testa olika produkter och upptäcka vad som fungerar bäst för din hud.',
    price: 399,
    interval: 'monthly',
    intervalCount: 1,
    trialDays: 14,
    features: [
      '1-2 produkter per månad',
      'Värde upp till 600 kr per box',
      'Personligt anpassat innehåll',
      'Gratis frakt',
      '14 dagars gratis provperiod',
      'Avsluta när du vill',
      'Exklusiva produkter först',
      'Hudvårdsguide och tips'
    ]
  },
  {
    name: 'Månadsbox - Komplett',
    description: 'För dig som vill ha en fullständig hudvårdsrutin levererad hem varje månad.',
    price: 649,
    interval: 'monthly',
    intervalCount: 1,
    trialDays: 14,
    features: [
      '2-3 produkter per månad',
      'Värde upp till 900 kr per box',
      'Komplett hudvårdsrutin',
      'Personligt anpassat innehåll',
      'Gratis frakt',
      '14 dagars gratis provperiod',
      'Avsluta när du vill',
      'Exklusiva produkter först',
      'Detaljerad hudvårdsguide',
      'Prioriterad kundservice'
    ]
  },
  {
    name: 'Kvartalsbox - Premium',
    description: 'Få en större leverans var tredje månad med våra bästa produkter och exklusiva nyheter.',
    price: 1499,
    interval: 'quarterly',
    intervalCount: 1,
    trialDays: 14,
    features: [
      '4-6 produkter per leverans',
      'Värde upp till 2500 kr per box',
      'Exklusiva limited edition produkter',
      'Personligt anpassat innehåll',
      'Gratis frakt',
      '14 dagars gratis provperiod',
      'Avsluta när du vill',
      'Första att testa nya produkter',
      'Personlig hudkonsultation (video)',
      'Exklusiva rabatter på fullstora produkter',
      'Prioriterad kundservice'
    ]
  },
  {
    name: 'Årsbox - VIP',
    description: 'Vår mest exklusiva prenumeration med årlig leverans och VIP-förmåner.',
    price: 4999,
    interval: 'yearly',
    intervalCount: 1,
    trialDays: 30,
    features: [
      '12-15 produkter per år',
      'Värde upp till 8000 kr',
      'Alla nya produkter inkluderade',
      'Exklusiva limited edition produkter',
      'Personligt anpassat innehåll',
      'Gratis frakt hela året',
      '30 dagars gratis provperiod',
      'Avsluta när du vill',
      'Personlig hudkonsultation (video, 2 ggr/år)',
      '25% rabatt på alla extra köp',
      'VIP kundservice',
      'Inbjudningar till exklusiva events',
      'Tidig tillgång till kampanjer'
    ]
  }
]

async function setupSubscriptionPlans() {
  try {
    console.log('🔄 Setting up subscription plans...\n')

    // First, deactivate all existing plans
    await prisma.subscriptionPlan.updateMany({
      data: { isActive: false }
    })
    console.log('📝 Deactivated existing plans')

    // Create new plans
    for (const planData of subscriptionPlans) {
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: planData.name,
          description: planData.description,
          price: planData.price,
          currency: 'SEK',
          interval: planData.interval,
          intervalCount: planData.intervalCount,
          trialDays: planData.trialDays,
          features: planData.features,
          isActive: true
        }
      })

      console.log(`✅ Created: ${plan.name} - ${plan.price} kr/${plan.interval}`)
      console.log(`   Features: ${planData.features.length} features`)
      console.log(`   Trial: ${plan.trialDays} days\n`)
    }

    // Show all active plans
    const activePlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    console.log('📦 Active subscription plans:')
    activePlans.forEach(plan => {
      console.log(`- ${plan.name}: ${plan.price} kr/${plan.interval}`)
    })

    console.log('\n✨ Subscription plans setup complete!')

  } catch (error) {
    console.error('❌ Error setting up subscription plans:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  setupSubscriptionPlans()
}

export { setupSubscriptionPlans } 