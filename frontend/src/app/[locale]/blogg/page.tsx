import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import BlogContent from './BlogContent';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

async function fetchBlogPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  return res.json();
}

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  return <BlogContent posts={posts} />;
} 