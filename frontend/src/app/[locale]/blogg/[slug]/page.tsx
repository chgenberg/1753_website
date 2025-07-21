import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

async function getPost(slug: string) {
  // Use internal API route that proxies to backend
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://1753website-production.up.railway.app' 
    : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog/${slug}`, { next: { revalidate: 3600 } });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    // Instead of throwing, return null to show not found
    return null;
  }

  return res.json();
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return {
      title: 'Blogg - 1753 Skincare',
      description: 'Läs våra senaste artiklar om hudvård, CBD och naturlig skönhet.'
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
    // Show a custom not found page instead of Next.js default
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-[#FAF8F5]">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-gray-400 text-2xl font-bold">1753</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Blogginlägg hittades inte
              </h1>
              <p className="text-gray-600 mb-8">
                Det inlägg du letar efter finns inte eller har flyttats. 
                Vi arbetar på att skapa fantastiskt innehåll för dig!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/blogg" 
                  className="inline-flex items-center px-6 py-3 bg-[#4A3428] text-white rounded-lg hover:bg-[#3A2A1E] transition-colors"
                >
                  Tillbaka till bloggen
                </Link>
                <Link 
                  href="/products" 
                  className="inline-flex items-center px-6 py-3 border border-[#4A3428] text-[#4A3428] rounded-lg hover:bg-[#4A3428] hover:text-white transition-colors"
                >
                  Utforska produkter
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-[#FAF8F5]">
        <div className="container mx-auto px-4 py-12">
          <article className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
              <Link href="/" className="hover:text-[#4A3428] transition-colors">Hem</Link>
              <span>/</span>
              <Link href="/blogg" className="hover:text-[#4A3428] transition-colors">Blogg</Link>
              <span>/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>

            {/* Article Header */}
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                {post.author && (
                  <span>Av {post.author}</span>
                )}
                {post.publishedAt && (
                  <span>
                    Publicerad: {new Date(post.publishedAt).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US')}
                  </span>
                )}
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
            </div>

            {/* Back to Blog */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link 
                href="/blogg"
                className="inline-flex items-center text-[#4A3428] hover:text-[#3A2A1E] transition-colors"
              >
                ← Tillbaka till bloggen
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
} 