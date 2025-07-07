import Discount, { IDiscount } from '../models/Discount'
import Order from '../models/Order'
import { IUser } from '../models/User'

export interface CartItem {
  productId: string
  quantity: number
  price: number
  category?: string
}

export interface DiscountCalculation {
  isValid: boolean
  discountAmount: number
  finalAmount: number
  errorMessage?: string
  appliedDiscounts: {
    code: string
    name: string
    type: string
    discountAmount: number
  }[]
}

export class DiscountService {
  /**
   * Validera och applicera rabattkod
   */
  static async applyDiscount(
    discountCode: string,
    cartItems: CartItem[],
    subtotal: number,
    userId?: string
  ): Promise<DiscountCalculation> {
    try {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true
      })

      if (!discount) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          errorMessage: 'Rabattkoden finns inte eller är inte aktiv',
          appliedDiscounts: []
        }
      }

      // Validera datum
      const now = new Date()
      if (now < discount.validFrom || now > discount.validUntil) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          errorMessage: 'Rabattkoden har gått ut eller är inte aktiv än',
          appliedDiscounts: []
        }
      }

      // Kontrollera användningsgräns
      if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          errorMessage: 'Rabattkoden har nått sin användningsgräns',
          appliedDiscounts: []
        }
      }

      // Kontrollera minimum orderbelopp
      if (discount.minimumOrderAmount && subtotal < discount.minimumOrderAmount) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          errorMessage: `Minimum orderbelopp är ${discount.minimumOrderAmount} SEK`,
          appliedDiscounts: []
        }
      }

      // Kontrollera per-kund gräns
      if (userId && discount.perCustomerLimit) {
        const customerUsage = await Order.countDocuments({
          'user': userId,
          'appliedDiscounts.code': discount.code,
          'status': { $ne: 'cancelled' }
        })

        if (customerUsage >= discount.perCustomerLimit) {
          return {
            isValid: false,
            discountAmount: 0,
            finalAmount: subtotal,
            errorMessage: 'Du har redan använt denna rabattkod maximalt antal gånger',
            appliedDiscounts: []
          }
        }
      }

      // Kontrollera första gången kund
      if (discount.firstTimeCustomerOnly && userId) {
        const previousOrders = await Order.countDocuments({
          'user': userId,
          'status': { $ne: 'cancelled' }
        })

        if (previousOrders > 0) {
          return {
            isValid: false,
            discountAmount: 0,
            finalAmount: subtotal,
            errorMessage: 'Denna rabatt är endast för förstagångskunder',
            appliedDiscounts: []
          }
        }
      }

      // Kontrollera produktbegränsningar
      const applicableItems = this.getApplicableItems(cartItems, discount)
      const applicableSubtotal = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      if (applicableSubtotal === 0) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          errorMessage: 'Rabattkoden gäller inte för produkterna i din varukorg',
          appliedDiscounts: []
        }
      }

      // Beräkna rabatt
      const discountAmount = this.calculateDiscountAmount(discount, applicableSubtotal, subtotal)
      const finalAmount = Math.max(0, subtotal - discountAmount)

      return {
        isValid: true,
        discountAmount,
        finalAmount,
        appliedDiscounts: [{
          code: discount.code,
          name: discount.name,
          type: discount.type,
          discountAmount
        }]
      }

    } catch (error) {
      console.error('Error applying discount:', error)
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: subtotal,
        errorMessage: 'Ett fel uppstod vid applicering av rabattkoden',
        appliedDiscounts: []
      }
    }
  }

  /**
   * Beräkna rabattbelopp baserat på typ
   */
  private static calculateDiscountAmount(
    discount: IDiscount,
    applicableSubtotal: number,
    totalSubtotal: number
  ): number {
    let discountAmount = 0

    switch (discount.type) {
      case 'percentage':
        discountAmount = (applicableSubtotal * discount.value) / 100
        break
      
      case 'fixed_amount':
        discountAmount = Math.min(discount.value, applicableSubtotal)
        break
      
      case 'free_shipping':
        // Implementera fraktberäkning här
        discountAmount = 0 // För nu, skulle vara fraktkostnad
        break
    }

    // Applicera maximum rabatt om satt
    if (discount.maximumDiscountAmount) {
      discountAmount = Math.min(discountAmount, discount.maximumDiscountAmount)
    }

    return Math.round(discountAmount * 100) / 100 // Avrunda till 2 decimaler
  }

  /**
   * Hitta produkter som rabatten gäller för
   */
  private static getApplicableItems(cartItems: CartItem[], discount: IDiscount): CartItem[] {
    return cartItems.filter(item => {
      // Om inga specifika produkter/kategorier är angivna, gäller för alla
      if (!discount.applicableProducts?.length && 
          !discount.applicableCategories?.length &&
          !discount.excludedProducts?.length &&
          !discount.excludedCategories?.length) {
        return true
      }

      // Kontrollera exkluderade produkter
      if (discount.excludedProducts?.some(id => id.toString() === item.productId)) {
        return false
      }

      // Kontrollera exkluderade kategorier
      if (item.category && discount.excludedCategories?.includes(item.category)) {
        return false
      }

      // Kontrollera inkluderade produkter
      if (discount.applicableProducts?.length) {
        return discount.applicableProducts.some(id => id.toString() === item.productId)
      }

      // Kontrollera inkluderade kategorier
      if (discount.applicableCategories?.length && item.category) {
        return discount.applicableCategories.includes(item.category)
      }

      return true
    })
  }

  /**
   * Markera rabatt som använd
   */
  static async markDiscountAsUsed(discountCode: string): Promise<void> {
    await Discount.findOneAndUpdate(
      { code: discountCode.toUpperCase() },
      { $inc: { usageCount: 1 } }
    )
  }

  /**
   * Hämta alla aktiva rabatter (för admin)
   */
  static async getActiveDiscounts(): Promise<IDiscount[]> {
    const now = new Date()
    return await Discount.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    }).sort({ createdAt: -1 })
  }

  /**
   * Skapa ny rabattkod
   */
  static async createDiscount(discountData: Partial<IDiscount>): Promise<IDiscount> {
    const discount = new Discount(discountData)
    return await discount.save()
  }

  /**
   * Automatiska rabatter (t.ex. volymrabatter)
   */
  static async getAutomaticDiscounts(
    cartItems: CartItem[],
    subtotal: number,
    userId?: string
  ): Promise<DiscountCalculation> {
    // Implementera automatiska rabatter här
    // T.ex. "Köp 3 betala för 2", volymrabatter, etc.
    
    return {
      isValid: false,
      discountAmount: 0,
      finalAmount: subtotal,
      appliedDiscounts: []
    }
  }
}

export default DiscountService 