import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

type MinimalPost = {
  slug: string
  title: string
  date: string
  summary?: string
  language: string
}

export default function FeaturedCarousel() {
  const { t, i18n } = useTranslation()
  const logDevWarning = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  }
  const [posts, setPosts] = useState<MinimalPost[]>([])
  const [index, setIndex] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const lang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]
      try {
        const pathsToTry = [`/data/featured-posts-${lang}.json`, '/data/featured-posts-en.json']
        for (const staticPath of pathsToTry) {
          const sr = await fetch(staticPath)
          const sct = sr.headers.get('content-type') || ''
          if (sr.ok && sct.includes('application/json')) {
            const sdata = await sr.json()
            if (mounted && Array.isArray(sdata)) {
              setPosts(sdata)
              return
            }
          }
        }
        if (mounted) setPosts([])
      } catch (err) {
        logDevWarning('Failed to load featured posts', err)
        if (mounted) setPosts([])
      }
    }

    load()
    return () => { mounted = false }
  }, [i18n.language, i18n.resolvedLanguage])

  useEffect(() => {
    if (posts.length <= 1) return
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % posts.length), 5000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [posts])

  if (!posts || posts.length === 0) return null

  const p = posts[index]
  if (!p) return null

  return (
    <div className="mt-8 max-w-3xl mx-auto text-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 shadow-md">
        <h3 className="text-sm text-blue-100 uppercase tracking-wider font-semibold mb-2">{t('blog.highlightTitle', 'From the Blog')}</h3>
        <Link href={`/blog/${p.slug}`} legacyBehavior passHref>
          <a className="block w-full text-left" role="link" aria-label={p.title} tabIndex={0}>
            <h4 className="text-lg sm:text-xl font-bold text-white hover:underline">{p.title}</h4>
            {p.summary && <p className="text-sm text-slate-200 mt-2 line-clamp-2">{p.summary}</p>}
            <div className="mt-3 text-xs text-slate-300">{new Date(p.date).toLocaleDateString(p.language === 'el' ? 'el-GR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </a>
        </Link>
        <div className="mt-3 flex items-center justify-center gap-2">
          {posts.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} aria-label={`Go to featured ${i+1}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
