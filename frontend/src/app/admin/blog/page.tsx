'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, LogOut } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  featured: boolean;
  imageUrl?: string;
}

export default function BlogAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Keynou Team',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    featured: false,
    imageUrl: '',
  });

  useEffect(() => {
    const adminPassword = localStorage.getItem('adminPassword');
    if (adminPassword) {
      setPassword(adminPassword);
      setIsAuthenticated(true);
      fetchBlogs(adminPassword);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('adminPassword', password);
    setIsAuthenticated(true);
    fetchBlogs(password);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
    setBlogs([]);
  };

  const fetchBlogs = async (adminPass: string, page: number = 1) => {
    try {
      const response = await fetch(`/api/blogs?page=${page}&perPage=10`, {
        headers: {
          'x-admin-password': adminPass,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch blogs');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        keywords: formData.keywords.split(',').map(kw => kw.trim()).filter(Boolean),
      };

      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : '/api/blogs';
      const method = editingBlog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        toast.success(editingBlog ? 'Blog updated successfully' : 'Blog created successfully');
        resetForm();
        fetchBlogs(password, currentPage);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save blog');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      tags: blog.tags.join(', '),
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      keywords: blog.keywords.join(', '),
      featured: blog.featured,
      imageUrl: blog.imageUrl || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': password,
        },
      });

      if (response.ok) {
        toast.success('Blog deleted successfully');
        fetchBlogs(password, currentPage);
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: 'Keynou Team',
      tags: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      featured: false,
      imageUrl: '',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Blog Admin Login</CardTitle>
            <CardDescription>Enter the admin password to manage blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Blog Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Create and manage blog posts for Keynou Drive</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              {editingBlog ? 'Edit Blog' : 'Create Blog'}
            </TabsTrigger>
            <TabsTrigger value="manage">Manage Blogs</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
                <CardDescription>Fill in the details below to create a new blog post</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Why Keynou Drive is the Best URL Shortener"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Keynou Team"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="A brief summary of the blog post (150-200 characters)"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content * (Supports HTML)</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Full blog post content with HTML formatting..."
                      rows={12}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="url shortener, link management, saas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Featured Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">SEO Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Leave empty to use the blog title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">SEO Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Leave empty to use the excerpt"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="url shortener, branded links, link tracking"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="featured">Featured Post</Label>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
                    </Button>
                    {editingBlog && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>All Blog Posts</CardTitle>
                <CardDescription>Manage your existing blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogs.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No blog posts yet. Create your first one!</p>
                  ) : (
                    blogs.map((blog) => (
                      <div key={blog.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{blog.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{blog.excerpt}</p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                              <span>Slug: {blog.slug}</span>
                              <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
                              {blog.featured && <span className="text-blue-600 font-semibold">Featured</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => fetchBlogs(password, currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => fetchBlogs(password, currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
