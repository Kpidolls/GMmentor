import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type Post = {
  slug: string
  title: string
  date: string
  summary: string
  content: string
  paragraphs?: string[]
  language: string
  originalSlug?: string
  tags?: string[]
}

const postsDirectory = path.join(process.cwd(), 'src', 'blog')

export function getAllPosts(language?: string): Post[] {
  if (!fs.existsSync(postsDirectory)) return []

  const filenames = fs.readdirSync(postsDirectory).filter((filename) => /\.mdx?$/.test(filename))

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    const { title, date, summary, paragraphs, tags } = data

    if (!date) throw new Error(`Missing date in frontmatter of ${filename}`)

    // Determine language and slug from filename
    const isGreek = filename.includes('-el.')
    const cleanSlug = filename.replace(/\.mdx?$/, '').replace(/-el$/, '')
    const postLanguage = isGreek ? 'el' : 'en'

    return {
      slug: filename.replace(/\.mdx?$/, ''),
      originalSlug: cleanSlug,
      title,
      date: typeof date === 'string' ? date : new Date(date).toISOString(),
      summary,
      content,
      language: postLanguage,
      ...(Array.isArray(paragraphs) ? { paragraphs } : {}),
      ...(Array.isArray(tags) ? { tags } : {}),
    }
  })

  // Filter by language if specified
  if (language) {
    return posts.filter(post => post.language === language)
  }

  return posts
}

export function getPostBySlug(slug: string, language: string = 'en'): Post | undefined {
  const posts = getAllPosts()
  
  // First try to find exact match
  let post = posts.find(p => p.slug === slug && p.language === language)
  
  // If not found and language is Greek, try with -el suffix
  if (!post && language === 'el') {
    post = posts.find(p => p.slug === `${slug}-el`)
  }
  
  // If not found and language is English, try without -el suffix
  if (!post && language === 'en') {
    post = posts.find(p => p.originalSlug === slug && p.language === 'en')
  }
  
  return post
}

export function getAlternateLanguagePost(post: Post): Post | undefined {
  const posts = getAllPosts()
  
  if (post.language === 'en') {
    // Look for Greek version
    return posts.find(p => p.slug === `${post.slug}-el`)
  } else {
    // Look for English version
    return posts.find(p => p.originalSlug === post.originalSlug && p.language === 'en')
  }
}