import { NextRequest, NextResponse } from 'next/server';
import { getBlogById, saveBlog, deleteBlog, generateSlug } from '@/lib/blog';
import type { BlogPost } from '@/lib/blog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = getBlogById(id);
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const existingBlog = getBlogById(id);
    
    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { title, excerpt, content, author, tags, metaTitle, metaDescription, keywords, featured, imageUrl } = body;
    
    const updatedBlog: BlogPost = {
      ...existingBlog,
      title: title || existingBlog.title,
      slug: title ? generateSlug(title) : existingBlog.slug,
      excerpt: excerpt || existingBlog.excerpt,
      content: content || existingBlog.content,
      author: author || existingBlog.author,
      tags: tags !== undefined ? tags : existingBlog.tags,
      metaTitle: metaTitle || existingBlog.metaTitle,
      metaDescription: metaDescription || existingBlog.metaDescription,
      keywords: keywords !== undefined ? keywords : existingBlog.keywords,
      featured: featured !== undefined ? featured : existingBlog.featured,
      imageUrl: imageUrl !== undefined ? imageUrl : existingBlog.imageUrl,
      updatedAt: new Date().toISOString(),
    };
    
    saveBlog(updatedBlog);
    
    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const success = deleteBlog(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
