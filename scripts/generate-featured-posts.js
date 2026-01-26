const fs = require('fs')
const path = require('path')

const matter = require('gray-matter')

function readAllPostsFromMd() {
  const postsDir = path.join(process.cwd(), 'src', 'blog')
  if (!fs.existsSync(postsDir)) return []
  const files = fs.readdirSync(postsDir).filter(f => /\.mdx?$/.test(f))
  return files.map(filename => {
    const filePath = path.join(postsDir, filename)
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)
    const isGreek = filename.includes('-el.')
    const cleanSlug = filename.replace(/\.mdx?$/, '').replace(/-el$/, '')
    const postLanguage = isGreek ? 'el' : 'en'
    return {
      slug: filename.replace(/\.mdx?$/, ''),
      originalSlug: cleanSlug,
      title: data.title || '',
      date: typeof data.date === 'string' ? data.date : (data.date ? new Date(data.date).toISOString() : new Date().toISOString()),
      summary: data.summary || '',
      content: content || '',
      language: postLanguage
    }
  })
}

function groupByOriginal(posts) {
  const byOriginal = {}
  posts.forEach(p => {
    const key = p.originalSlug || p.slug
    byOriginal[key] = byOriginal[key] || []
    byOriginal[key].push(p)
  })
  return byOriginal
}

function pickFeatured(posts, preferredLang) {
  const byOriginal = groupByOriginal(posts)
  const picks = Object.values(byOriginal).map(group => {
    const pref = group.find(p => p.language === preferredLang)
    if (pref) return pref
    const en = group.find(p => p.language === 'en')
    return en || group[0]
  }).filter(Boolean)

  const featured = picks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,3)
  return featured.map(p => ({ slug: p.slug, title: p.title, date: p.date, summary: p.summary, language: p.language, originalSlug: p.originalSlug }))
}

function writeFile(name, data) {
  const outDir = path.join(process.cwd(), 'public', 'data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const filePath = path.join(outDir, name)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  console.log('Wrote', filePath)
}

function main() {
  const posts = readAllPostsFromMd()
  const en = pickFeatured(posts, 'en')
  const el = pickFeatured(posts, 'el')
  writeFile('featured-posts-en.json', en)
  writeFile('featured-posts-el.json', el)
}

main()
