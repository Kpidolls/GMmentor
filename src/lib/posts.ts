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
}

const postsDirectory = path.join(process.cwd(), 'src', 'blog')

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return []

  const filenames = fs.readdirSync(postsDirectory).filter((filename) => /\.mdx?$/.test(filename))

  return filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    const { title, date, summary, paragraphs } = data

    if (!date) throw new Error(`Missing date in frontmatter of ${filename}`)

    return {
      slug: filename.replace(/\.mdx?$/, ''),
      title,
      date: typeof date === 'string' ? date : new Date(date).toISOString(),
      summary,
      content,
      ...(Array.isArray(paragraphs) ? { paragraphs } : {}),
    }
  })
}