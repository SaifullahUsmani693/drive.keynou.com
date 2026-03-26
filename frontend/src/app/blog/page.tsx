import { Metadata } from 'next';
import Link from 'next/link';
import { getPaginatedBlogs } from '@/lib/blog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - Keynou Drive | URL Shortening Insights & Best Practices',
  description: 'Discover why Keynou Drive is the best URL shortener for SaaS teams. Learn about branded links, analytics, custom domains, and link management strategies.',
  keywords: [
    'url shortener blog',
    'link management tips',
    'branded url shortener',
    'short link best practices',
    'url shortening guide',
    'keynou drive blog',
    'saas marketing tools',
    'link tracking analytics',
  ],
  openGraph: {
    title: 'Blog - Keynou Drive | URL Shortening Insights',
    description: 'Expert insights on URL shortening, branded links, and link management for modern SaaS teams.',
    url: 'https://drive.keynou.com/blog',
    siteName: 'Keynou Drive',
    type: 'website',
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const { blogs, pagination } = getPaginatedBlogs(currentPage, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Keynou Drive Blog
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Insights, best practices, and expert tips on URL shortening, branded links, and link management for modern SaaS teams.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No blog posts yet. Check back soon for insights on URL shortening and link management!
            </p>
            <Link href="/signup" className="inline-block mt-6">
              <Button size="lg">
                Get Started with Keynou Drive
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    {blog.imageUrl && (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={blog.publishedAt}>
                          {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                      <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 mt-2">
                        {blog.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                {pagination.hasPrevPage && (
                  <Link href={`/blog?page=${currentPage - 1}`}>
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Link key={page} href={`/blog?page=${page}`}>
                      <Button
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                      >
                        {page}
                      </Button>
                    </Link>
                  ))}
                </div>

                {pagination.hasNextPage && (
                  <Link href={`/blog?page=${currentPage + 1}`}>
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}

            <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Link Management?</h2>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of SaaS teams using Keynou Drive for branded URL shortening, advanced analytics, and custom domains.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
