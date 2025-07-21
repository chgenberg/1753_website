import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all raw materials
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const where: any = {
      isActive: true
    };
    
    if (category && category !== 'all') {
      where.category = category as string;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { swedishName: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    const rawMaterials = await prisma.rawMaterial.findMany({
      where,
      select: {
        id: true,
        name: true,
        swedishName: true,
        origin: true,
        category: true,
        description: true,
        healthBenefits: true,
        slug: true,
        thumbnail: true
      },
      orderBy: {
        swedishName: 'asc'
      }
    });
    
    res.json(rawMaterials);
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    res.status(500).json({ error: 'Failed to fetch raw materials' });
  }
});

// Get single raw material by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const rawMaterial = await prisma.rawMaterial.findUnique({
      where: { slug }
    });
    
    if (!rawMaterial) {
      return res.status(404).json({ error: 'Raw material not found' });
    }
    
    res.json(rawMaterial);
  } catch (error) {
    console.error('Error fetching raw material:', error);
    res.status(500).json({ error: 'Failed to fetch raw material' });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await prisma.rawMaterial.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        category: true
      }
    });
    
    const formattedCategories = categories.map(cat => ({
      id: cat.category,
      name: getCategoryName(cat.category),
      count: cat._count.category
    }));
    
    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    berry: 'Bär',
    vegetable: 'Grönsaker',
    fruit: 'Frukt',
    herb: 'Örter',
    fermented: 'Fermenterat',
    nut_seed: 'Nötter & Frön',
    tea: 'Te',
    mushroom: 'Svamp',
    oil: 'Oljor',
    fish: 'Fisk',
    grain: 'Spannmål',
    root: 'Rotfrukter',
    other: 'Övrigt'
  };
  
  return names[category] || category;
}

export default router; 