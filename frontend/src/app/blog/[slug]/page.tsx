import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllBlogs, getBlogBySlug } from '@/lib/blog';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/blog/ShareButton';
import { ArrowLeft, ArrowRight, Calendar, User, Tag } from 'lucide-react';

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found - Keynou Drive',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drive.keynou.com';

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    keywords: blog.keywords,
    authors: [{ name: blog.author }],
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      url: `${siteUrl}/blog/${blog.slug}`,
      siteName: 'Keynou Drive',
      type: 'article',
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author],
      images: blog.imageUrl ? [
        {
          url: blog.imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: blog.imageUrl ? [blog.imageUrl] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drive.keynou.com';
  const blogUrl = `${siteUrl}/blog/${blog.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.imageUrl || `${siteUrl}/og-preview.png`,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Person',
      name: blog.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Keynou Drive',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/keynou_drove_logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    keywords: blog.keywords.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          <header className="mb-12">
            {blog.imageUrl && (
              <div className="w-full h-96 overflow-hidden rounded-2xl mb-8">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <time dateTime={blog.publishedAt}>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>

            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
              {blog.excerpt}
            </p>
          </header>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12
              prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
              prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 dark:prose-strong:text-slate-100
              prose-ul:text-slate-700 dark:prose-ul:text-slate-300
              prose-ol:text-slate-700 dark:prose-ol:text-slate-300
              prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100
              prose-blockquote:border-blue-600 prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-3">Ready to Get Started with Keynou Drive?</h2>
              <p className="text-lg mb-6 opacity-90">
                Experience the best URL shortener for SaaS teams. Create branded links, track analytics, and manage custom domains.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
                  Sign Up for Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-8">
            <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium">
              ← All Blog Posts
            </Link>
            <ShareButton title={blog.title} excerpt={blog.excerpt} url={blogUrl} />
          </div>
        </div>
      </article>
    </>
  );
}
