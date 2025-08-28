import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const email = 'admin@1753.se'
    const password = 'Admin123!'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Update existing user to admin role
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })
      console.log(`✅ Updated existing user ${email} to ADMIN role`)
    } else {
      // Create new admin user
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isEmailVerified: true,
          language: 'sv',
          newsletter: false,
          emailNotifications: true,
          smsNotifications: false,
          orderUpdates: true,
          skinJourneyReminders: false,
          skinConcerns: []
        }
      })
      console.log(`✅ Created admin user: ${email}`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔑 Password: ${password}`)
    }

    console.log('✅ Admin user setup completed!')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser() 