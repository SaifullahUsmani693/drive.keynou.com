import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogs, saveBlog, generateSlug } from '@/lib/blog';
import type { BlogPost } from '@/lib/blog';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    
    const blogs = getAllBlogs();
    const sortedBlogs = blogs.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    const totalBlogs = sortedBlogs.length;
    const totalPages = Math.ceil(totalBlogs / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    return NextResponse.json({
      blogs: sortedBlogs.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        perPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, excerpt, content, author, tags, metaTitle, metaDescription, keywords, featured, imageUrl } = body;
    
    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    
    const newBlog: BlogPost = {
      id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slug,
      title,
      excerpt,
      content,
      author: author || 'Keynou Team',
      publishedAt: now,
      updatedAt: now,
      tags: tags || [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      keywords: keywords || [],
      featured: featured || false,
      imageUrl: imageUrl || undefined,
    };
    
    saveBlog(newBlog);
    
    return NextResponse.json({ success: true, blog: newBlog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
