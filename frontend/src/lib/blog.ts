import fs from 'fs';
import path from 'path';

export interface BlogPost {
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

const BLOGS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'blogs.json');

export function getAllBlogs(): BlogPost[] {
  try {
    const fileContents = fs.readFileSync(BLOGS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const blogs = getAllBlogs();
  return blogs.find(blog => blog.slug === slug) || null;
}

export function getBlogById(id: string): BlogPost | null {
  const blogs = getAllBlogs();
  return blogs.find(blog => blog.id === id) || null;
}

export function getPaginatedBlogs(page: number = 1, perPage: number = 10) {
  const blogs = getAllBlogs();
  const sortedBlogs = blogs.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  const totalBlogs = sortedBlogs.length;
  const totalPages = Math.ceil(totalBlogs / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return {
    blogs: sortedBlogs.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages,
      totalBlogs,
      perPage,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  };
}

export function saveBlog(blog: BlogPost): void {
  const blogs = getAllBlogs();
  const existingIndex = blogs.findIndex(b => b.id === blog.id);
  
  if (existingIndex >= 0) {
    blogs[existingIndex] = blog;
  } else {
    blogs.push(blog);
  }
  
  fs.writeFileSync(BLOGS_FILE_PATH, JSON.stringify(blogs, null, 2), 'utf8');
}

export function deleteBlog(id: string): boolean {
  const blogs = getAllBlogs();
  const filteredBlogs = blogs.filter(b => b.id !== id);
  
  if (filteredBlogs.length === blogs.length) {
    return false;
  }
  
  fs.writeFileSync(BLOGS_FILE_PATH, JSON.stringify(filteredBlogs, null, 2), 'utf8');
  return true;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
