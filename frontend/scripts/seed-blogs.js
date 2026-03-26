const fs = require('fs');
const path = require('path');

const initialBlogs = require('../src/data/initial-blog-posts.json');
const blogsFilePath = path.join(__dirname, '../src/data/blogs.json');

try {
  const existingBlogs = fs.existsSync(blogsFilePath) 
    ? JSON.parse(fs.readFileSync(blogsFilePath, 'utf8'))
    : [];

  if (existingBlogs.length === 0) {
    fs.writeFileSync(blogsFilePath, JSON.stringify(initialBlogs, null, 2), 'utf8');
    console.log(`✅ Successfully seeded ${initialBlogs.length} blog posts!`);
  } else {
    console.log(`ℹ️  Blog posts already exist (${existingBlogs.length} posts). Skipping seed.`);
    console.log('   To re-seed, delete src/data/blogs.json and run this script again.');
  }
} catch (error) {
  console.error('❌ Error seeding blogs:', error);
  process.exit(1);
}
