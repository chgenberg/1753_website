
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

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

function overlayBlog(post: any, t: any | null) {
  if (!t) return post
  return {
    ...post,
    title: t.title ?? post.title,
    content: t.content ?? post.content,
    excerpt: t.excerpt ?? post.excerpt,
    metaTitle: t.metaTitle ?? post.metaTitle,
    metaDescription: t.metaDescription ?? post.metaDescription
  }
}

// Hämta alla publicerade blogginlägg
router.get('/', async (req, res) => {
  try {
    const locale = getRequestedLocale(req)
    let posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });

    if (locale !== 'sv' && posts.length) {
      const ids = posts.map((p) => p.id)
      const translations = await prisma.blogPostTranslation.findMany({
        where: { postId: { in: ids }, locale }
      })
      const byId: Record<number, any> = {}
      for (const t of translations) byId[t.postId] = t
      posts = posts.map((p) => overlayBlog(p, byId[p.id] || null))
    }

    // Add compatibility fields for frontend
    const postsWithCompatibility = posts.map(post => ({
      ...post,
      date: post.publishedAt, // Add date field for backward compatibility
      readingTime: `${Math.ceil((post.content?.length || 0) / 1000)} min` // Estimate reading time
    }));

    res.json(postsWithCompatibility);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta blogginlägg' });
  }
});

// Hämta ett specifikt blogginlägg med slug
router.get('/:slug', async (req, res) => {
  try {
    const locale = getRequestedLocale(req)
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug, published: true },
    });
    if (post) {
      let finalPost = post;
      if (locale !== 'sv') {
        const t = await prisma.blogPostTranslation.findUnique({
          where: { postId_locale: { postId: post.id, locale } }
        })
        finalPost = overlayBlog(post, t)
      }
      
      // Add compatibility fields
      const postWithCompatibility = {
        ...finalPost,
        date: finalPost.publishedAt,
        readingTime: `${Math.ceil((finalPost.content?.length || 0) / 1000)} min`
      };
      
      return res.json(postWithCompatibility);
    } else {
      res.status(404).json({ error: 'Blogginlägg hittades inte' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta blogginlägg' });
  }
});

export default router; 