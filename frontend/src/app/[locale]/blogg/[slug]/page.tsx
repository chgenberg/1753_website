import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

async function getPost(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`, { next: { revalidate: 3600 } });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Failed to fetch post');
  }

  return res.json();
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return {
      title: 'Inlägg hittades inte',
    }
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}


export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="prose lg:prose-xl mx-auto py-8 px-4">
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">
        Publicerad: {new Date(post.publishedAt).toLocaleDateString(locale)}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
    </article>
  );
} 