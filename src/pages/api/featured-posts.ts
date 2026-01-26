import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllPosts } from '../../lib/posts'
import type { Post } from '../../lib/posts'

type MinimalPost = {
  slug: string
  title: string
  date: string
  summary?: string
  language: string
  originalSlug?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<MinimalPost[]>) {
  try {
    const posts = getAllPosts()
    // group by originalSlug and prefer latest per original
    const byOriginal: Record<string, Post[]> = {}
    posts.forEach((p: Post) => {
      const key = p.originalSlug || p.slug
      byOriginal[key] = byOriginal[key] || []
      byOriginal[key].push(p)
    })

    const picks = Object.values(byOriginal).map((group: Post[]) => {
      // prefer same language as query param if provided
      const lang = (req.query.lang as string) || undefined
      if (lang) {
        const preferred = group.find((g: Post) => g.language === lang)
        if (preferred) return preferred
      }
      // fall back to newest
      return group.sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    }).filter((p): p is Post => Boolean(p))

    const featured = picks
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)

    const minimal: MinimalPost[] = featured.map((p) => ({ slug: p.slug, title: p.title, date: p.date, summary: p.summary, language: p.language, originalSlug: p.originalSlug }))

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return res.status(200).json(minimal)
  } catch (err) {
    console.error(err)
    return res.status(500).json([])
  }
}
