
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Hämta alla publicerade blogginlägg
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta blogginlägg' });
  }
});

// Hämta ett specifikt blogginlägg med slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug, published: true },
    });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Blogginlägg hittades inte' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta blogginlägg' });
  }
});

export default router; 