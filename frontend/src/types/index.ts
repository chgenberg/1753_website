// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  avatar?: string
  skinJourney?: SkinJourney
  preferences: UserPreferences
  addresses: Address[]
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  language: 'sv' | 'en' | 'es'
  newsletter: boolean
  skinType: SkinType
  skinConcerns: string[]
  notifications: {
    email: boolean
    sms: boolean
    orderUpdates: boolean
    skinJourneyReminders: boolean
  }
}

export interface SkinJourney {
  id: string
  userId: string
  startDate: string
  currentPhase: string
  progress: SkinJourneyEntry[]
  photos: SkinPhoto[]
  products: string[] // Product IDs
  notes: string
  nextCheckIn: string
}

export interface SkinJourneyEntry {
  id: string
  date: string
  skinCondition: number // 1-10 rating
  notes: string
  photos?: string[]
}

export interface SkinPhoto {
  id: string
  url: string
  date: string
  type: 'before' | 'progress' | 'after'
}

// Product types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  longDescription?: string
  price: number
  compareAtPrice?: number
  sku?: string
  barcode?: string
  category?: string
  tags: string[]
  images: any[] // Raw image data from Prisma
  variants: any[] // Raw variant data from Prisma
  inventory: number
  trackInventory: boolean
  allowBackorder: boolean
  isActive: boolean
  isFeatured: boolean
  metaTitle?: string
  metaDescription?: string
  seoKeywords: string[]
  keyIngredients: string[]
  howToUse?: string
  skinTypes: string[]
  skinConcerns: string[]
  timeOfDay?: string
  
  // New detailed fields from 1753-products-blocks.txt
  benefitsDetails?: DetailedBenefit[]
  ingredientsDetails?: DetailedIngredient[]
  imagesData?: DetailedImage[]
  
  // Rating data from API
  rating: {
    average: number
    count: number
  }
  
  createdAt: string
  updatedAt: string
}

export interface DetailedIngredient {
  name: string
  description: string
  benefits: string[]
  concentration?: string
}

export interface DetailedBenefit {
  title: string
  description: string
}

export interface DetailedImage {
  url: string
  alt: string
  position: number
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  position: number
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  compareAtPrice?: number
  sku: string
  inventory: {
    quantity: number
    trackQuantity: boolean
  }
  options: {
    size?: string
    color?: string
  }
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  parent?: string
}

export interface Ingredient {
  id: string
  name: string
  description: string
  benefits: string[]
  concentration?: string
}

export type SkinType = 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal' | 'acne' | 'mature'

// Order types
export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  shippingMethod: ShippingMethod
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  total: number
  product: {
    name: string
    image: string
    sku: string
  }
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'

export interface Address {
  id: string
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export interface PaymentMethod {
  type: 'viva_wallet' | 'card' | 'paypal' | 'klarna'
  brand?: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
}

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
}

// Cart types
export interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  product: Pick<Product, 'id' | 'name' | 'images' | 'slug'>
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
}

// Content types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: {
    name: string
    avatar: string
    bio: string
  }
  category: string
  tags: string[]
  published: boolean
  publishedAt: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  createdAt: string
  updatedAt: string
}

// Review types (Judge.me)
export interface Review {
  id: number;
  rating: number;
  title: string;
  body: string;
  author: string;
  email: string;
  status: 'PENDING' | 'APPROVED';
  createdAt: string;
  product: {
    name: string;
    slug: string;
    images?: any[];
    price?: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code: string
  details?: any
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface NewsletterFormData {
  email: string
  firstName?: string
  skinType?: SkinType
  interests: string[]
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  newsletter: boolean
} 