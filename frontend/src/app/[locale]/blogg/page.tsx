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

async function fetchBlogPosts(locale: string) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://1753website-production.up.railway.app' 
    : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog?locale=${encodeURIComponent(locale)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  return res.json();
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const posts = await fetchBlogPosts(locale);
  return (
    <>
      <Header />
      <BlogContent posts={posts} />
      <Footer />
    </>
  );
} 