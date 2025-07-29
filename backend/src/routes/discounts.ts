import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const validateDiscountCodeSchema = z.object({
  code: z.string().min(1, 'Rabattkod krävs'),
  orderTotal: z.number().min(0, 'Orderbelopp måste vara positivt')
})

const createDiscountCodeSchema = z.object({
  code: z.string().min(2, 'Kod måste vara minst 2 tecken').max(50, 'Kod får max vara 50 tecken'),
  name: z.string().min(1, 'Namn krävs'),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed_amount']),
  value: z.number().min(0.01, 'Värde måste vara positivt'),
  minimumOrderAmount: z.number().optional(),
  maximumDiscount: z.number().optional(),
  usageLimit: z.number().int().optional(),
  perCustomerLimit: z.number().int().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  firstTimeCustomersOnly: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional()
})

// Validate discount code
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = validateDiscountCodeSchema.parse(req.body)

    // Find the discount code
    const discountCode = await prisma.discountCode.findUnique({
      where: { 
        code: code.toUpperCase() 
      }
    })

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Ogiltig rabattkod'
      })
    }

    // Check if code is active
    if (!discountCode.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Denna rabattkod är inte längre aktiv'
      })
    }

    // Check date validity
    const now = new Date()
    if (discountCode.validFrom && new Date(discountCode.validFrom) > now) {
      return res.status(400).json({
        success: false,
        message: 'Denna rabattkod är inte giltig än'
      })
    }

    if (discountCode.validUntil && new Date(discountCode.validUntil) < now) {
      return res.status(400).json({
        success: false,
        message: 'Denna rabattkod har gått ut'
      })
    }

    // Check minimum order amount
    if (discountCode.minimumOrderAmount && orderTotal < discountCode.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minsta orderbelopp för denna rabattkod är ${discountCode.minimumOrderAmount} kr`
      })
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Denna rabattkod har använts maximalt antal gånger'
      })
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discountCode.type === 'percentage') {
      discountAmount = (orderTotal * discountCode.value) / 100
      // Apply maximum discount if set
      if (discountCode.maximumDiscount && discountAmount > discountCode.maximumDiscount) {
        discountAmount = discountCode.maximumDiscount
      }
    } else if (discountCode.type === 'fixed_amount') {
      discountAmount = Math.min(discountCode.value, orderTotal) // Can't discount more than order total
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100

    return res.json({
      success: true,
      discountCode: {
        id: discountCode.id,
        code: discountCode.code,
        name: discountCode.name,
        description: discountCode.description,
        type: discountCode.type,
        value: discountCode.value,
        discountAmount
      },
      newTotal: orderTotal - discountAmount
    })

  } catch (error) {
    console.error('Error validating discount code:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Ogiltiga data',
        errors: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Serverfel vid validering av rabattkod'
    })
  }
})

// Apply discount code to order (called when order is created)
router.post('/apply', async (req, res) => {
  try {
    const { orderId, discountCodeId, discountAmount, originalAmount } = req.body

    // Create order discount record
    const orderDiscount = await prisma.orderDiscount.create({
      data: {
        orderId,
        discountCodeId,
        discountCode: '', // Will be populated from the relation
        discountAmount,
        originalAmount
      },
      include: {
        discount: true
      }
    })

    // Update discount code usage count
    await prisma.discountCode.update({
      where: { id: discountCodeId },
      data: {
        usageCount: {
          increment: 1
        }
      }
    })

    return res.json({
      success: true,
      orderDiscount
    })

  } catch (error) {
    console.error('Error applying discount code:', error)
    return res.status(500).json({
      success: false,
      message: 'Serverfel vid applicering av rabattkod'
    })
  }
})

// Get all discount codes (admin only)
router.get('/', async (req, res) => {
  try {
    const discountCodes = await prisma.discountCode.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            orderDiscounts: true
          }
        }
      }
    })

    return res.json({
      success: true,
      discountCodes
    })
  } catch (error) {
    console.error('Error fetching discount codes:', error)
    return res.status(500).json({
      success: false,
      message: 'Serverfel vid hämtning av rabattkoder'
    })
  }
})

// Create new discount code (admin only)
router.post('/', async (req, res) => {
  try {
    const validatedData = createDiscountCodeSchema.parse(req.body)

    const discountCode = await prisma.discountCode.create({
      data: {
        ...validatedData,
        code: validatedData.code.toUpperCase(), // Always store codes in uppercase
        validFrom: validatedData.validFrom ? new Date(validatedData.validFrom) : new Date(),
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null
      }
    })

    return res.status(201).json({
      success: true,
      discountCode
    })

  } catch (error) {
    console.error('Error creating discount code:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Ogiltiga data',
        errors: error.errors
      })
    }

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'En rabattkod med denna kod finns redan'
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Serverfel vid skapande av rabattkod'
    })
  }
})

// Update discount code (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = createDiscountCodeSchema.partial().parse(req.body)

    const updateData = {
      ...validatedData,
      ...(validatedData.code && { code: validatedData.code.toUpperCase() }),
      ...(validatedData.validFrom && { validFrom: new Date(validatedData.validFrom) }),
      ...(validatedData.validUntil && { validUntil: new Date(validatedData.validUntil) })
    }

    const discountCode = await prisma.discountCode.update({
      where: { id },
      data: updateData
    })

    return res.json({
      success: true,
      discountCode
    })

  } catch (error) {
    console.error('Error updating discount code:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Ogiltiga data',
        errors: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Serverfel vid uppdatering av rabattkod'
    })
  }
})

// Delete discount code (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.discountCode.delete({
      where: { id }
    })

    return res.json({
      success: true,
      message: 'Rabattkod borttagen'
    })

  } catch (error) {
    console.error('Error deleting discount code:', error)
    return res.status(500).json({
      success: false,
      message: 'Serverfel vid borttagning av rabattkod'
    })
  }
})

export default router 