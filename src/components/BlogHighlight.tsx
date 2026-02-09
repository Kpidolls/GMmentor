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
  const resolvedLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]

  // Deduplicate by originalSlug, preferring current language then English
  const deduped = Object.values(
    (allPosts || []).reduce<Record<string, MinimalPost>>((acc, post) => {
      const key = post.originalSlug || post.slug
      const existing = acc[key]
      
      // Keep post if:
      // 1. First encounter, OR
      // 2. Current language matches, OR
      // 3. No existing match and this is English (fallback)
      if (!existing ||
          post.language === resolvedLanguage ||
          (existing.language !== resolvedLanguage && post.language === 'en')) {
        acc[key] = post
      }
      return acc
    }, {})
  )

  // Sort by date desc and take top 3
  const featured = deduped
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <section id="blog-highlight" className="relative z-10 py-12 bg-white pointer-events-auto">
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
          {featured.map((post) => {
            const href = post.originalSlug || post.slug
            return (
              <Link 
                key={href} 
                href={`/blog/${href}`} 
                className="block h-full group no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
              >
                {/* Semantic article with proper styling and hover effects */}
                <article 
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col h-full cursor-pointer hover:border-blue-200"
                  role="article"
                >
                  <div className="flex-1">
                    {/* Clickable title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {post.title}
                    </h3>
                    {/* Clickable summary */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
                      {post.summary}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <time dateTime={post.date} className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString(
                        resolvedLanguage === 'el' ? 'el-GR' : 'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </time>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-800 transition-colors duration-200">
                      {t('blog.readMore', 'Read more')}
                      <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/blog" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('blog.viewAll', 'View all articles')}
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
