import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import BlogContent from './BlogContent';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

async function fetchBlogPosts() {
  // Use internal Next.js API proxy to backend so it works in all envs
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/blog`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  return res.json();
}

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  return <BlogContent posts={posts} />;
} 