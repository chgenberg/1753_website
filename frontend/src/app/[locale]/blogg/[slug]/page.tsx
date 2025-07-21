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
    description: post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
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
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-gray-600">
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {post.author && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{post.author}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Featured Image (if available) */}
            {post.featuredImage && (
              <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg prose-gray max-w-none 
                          prose-headings:font-bold prose-headings:text-gray-900
                          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                          prose-a:text-[#4A3428] prose-a:underline hover:prose-a:no-underline
                          prose-ul:my-6 prose-li:my-2
                          prose-strong:text-gray-900 prose-strong:font-semibold
                          prose-blockquote:border-l-4 prose-blockquote:border-[#4A3428] prose-blockquote:pl-6 prose-blockquote:italic">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Call to Action */}
            <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Intresserad av mer innehåll?
              </h3>
              <p className="text-gray-600 mb-6">
                Utforska våra naturliga hudvårdsprodukter baserade på CBD och funktionella svampar.
              </p>
              <Link 
                href="/products"
                className="inline-flex items-center px-8 py-4 bg-[#4A3428] text-white rounded-lg hover:bg-[#3A2A1E] transition-all transform hover:scale-105 shadow-lg"
              >
                Se våra produkter
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Back to Blog */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link 
                href="/blogg"
                className="inline-flex items-center text-[#4A3428] hover:text-[#3A2A1E] transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tillbaka till bloggen
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
} 