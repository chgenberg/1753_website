import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const SUPPORTED_LOCALES = ['sv', 'en', 'es', 'de', 'fr'] as const

type SupportedLocale = typeof SUPPORTED_LOCALES[number]

function getRequestedLocale(req: any): SupportedLocale {
  const q = (req.query.locale as string | undefined)?.toLowerCase()
  if (q && (SUPPORTED_LOCALES as readonly string[]).includes(q)) return q as SupportedLocale
  const h = (req.headers['accept-language'] as string | undefined) || ''
  const candidate = h.split(',')[0]?.split('-')[0]?.toLowerCase()
  if (candidate && (SUPPORTED_LOCALES as readonly string[]).includes(candidate)) return candidate as SupportedLocale
  return 'sv'
}

function overlayRawMaterial(r: any, t: any | null) {
  if (!t) return r
  return {
    ...r,
    name: t.name ?? r.name,
    description: t.description ?? r.description,
    healthBenefits: Array.isArray(t.healthBenefits) && t.healthBenefits.length ? t.healthBenefits : r.healthBenefits,
    nutrients: Array.isArray(t.nutrients) && t.nutrients.length ? t.nutrients : r.nutrients,
    metaTitle: t.metaTitle ?? r.metaTitle,
    metaDescription: t.metaDescription ?? r.metaDescription
  }
}

// Get all raw materials with Swedish sorting
router.get('/', async (req, res) => {
  try {
    const locale = getRequestedLocale(req)
    let rawMaterials = await prisma.rawMaterial.findMany({
      orderBy: { name: 'asc' },
    });

    if (locale !== 'sv' && rawMaterials.length) {
      const ids = rawMaterials.map((r) => r.id)
      const translations = await prisma.rawMaterialTranslation.findMany({ where: { rawMaterialId: { in: ids }, locale } })
      const byId: Record<string, any> = {}
      for (const t of translations) byId[t.rawMaterialId] = t
      rawMaterials = rawMaterials.map((r) => overlayRawMaterial(r, byId[r.id] || null))
    }

    res.json({
      success: true,
      data: rawMaterials,
    });
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch raw materials',
    });
  }
});

// Get single raw material by slug
router.get('/:slug', async (req, res) => {
  try {
    const locale = getRequestedLocale(req)
    const { slug } = req.params;
    
    const rawMaterial = await prisma.rawMaterial.findUnique({
      where: { slug }
    });
    
    if (!rawMaterial) {
      return res.status(404).json({ error: 'Raw material not found' });
    }

    if (locale !== 'sv') {
      const t = await prisma.rawMaterialTranslation.findUnique({ where: { rawMaterialId_locale: { rawMaterialId: rawMaterial.id, locale } } })
      const overlaid = overlayRawMaterial(rawMaterial, t)
      return res.json(overlaid)
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