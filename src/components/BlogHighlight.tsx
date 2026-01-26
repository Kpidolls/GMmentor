import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
type MinimalPost = {
  slug: string
  title: string
  date: string
  summary?: string
  language: string
  originalSlug?: string
}

type Props = { allPosts: MinimalPost[] }

export default function BlogHighlight({ allPosts }: Props) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language || 'en'

  // Group posts by their originalSlug to avoid showing both language versions
  const byOriginal = (allPosts || []).reduce<Record<string, MinimalPost[]>>((acc, p) => {
    const key = p.originalSlug || p.slug
    acc[key] = acc[key] || []
    acc[key].push(p)
    return acc
  }, {})

  // Prefer posts in the current language; fall back to English, then any available
  const picks = Object.values(byOriginal).map((group) => {
    const preferred = group.find((p) => p.language === currentLang)
    if (preferred) return preferred
    const en = group.find((p) => p.language === 'en')
    return en || group[0]
  }).filter((p): p is MinimalPost => Boolean(p))

  // Sort by date desc and take top 3
  const featured = picks
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <section id="blog-highlight" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            {t('navigation.blog')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('meta.blogDescriptionShort')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((post) => (
            <article key={post.slug} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-6 flex flex-col card-elevate border-subtle">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.summary}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <time className="text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString(post.language === 'el' ? 'el-GR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </time>
                <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-blue-600">
                  {t('blog.readMore', 'Read more')} →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/blog" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition">
            {t('blog.viewAll', 'View all articles')}
          </Link>
        </div>
      </div>
    </section>
  )
}
