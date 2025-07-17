import prisma from '../lib/prisma'
import type { Product, Prisma } from '@prisma/client'

export type CreateProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProductData = Partial<CreateProductData>

export class ProductService {
  static async create(data: CreateProductData): Promise<Product> {
    return await prisma.product.create({
      data
    })
  }

  static async findById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    })
  }

  static async findBySlug(slug: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            replies: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async findAll(options: {
    skip?: number
    take?: number
    where?: Prisma.ProductWhereInput
    orderBy?: Prisma.ProductOrderByWithRelationInput
  } = {}): Promise<Product[]> {
    const { skip = 0, take = 50, where = {}, orderBy = { createdAt: 'desc' } } = options
    
    return await prisma.product.findMany({
      where: {
        isActive: true,
        ...where
      },
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    })
  }

  static async findFeatured(): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    })
  }

  static async update(id: string, data: UpdateProductData): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data
    })
  }

  static async delete(id: string): Promise<Product> {
    return await prisma.product.delete({
      where: { id }
    })
  }

  static async search(query: string): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    })
  }

  static async getStats(productId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: 'APPROVED'
      },
      select: {
        rating: true
      }
    })

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0

    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length
    }))

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    }
  }
}

// Export a default interface that matches the old Mongoose model
export { Product }
export default ProductService 