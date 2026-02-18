import { GetStaticPaths, GetStaticProps } from 'next'
import { getAllPosts, Post, getAlternateLanguagePost } from '../../lib/posts'
import { Box, Heading, Text, Container, Image, Link, Code, HStack, Button, Alert, AlertIcon } from '@chakra-ui/react'
import Head from 'next/head'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import NextLink from 'next/link'
import { generateBlogMetaDescription } from '../../config/metaDescriptions'
import { formatPostDate } from '../../utils/dateUtils'

const MarkdownComponents = {
  h1: (props: ComponentProps<'h1'>) => <Heading as="h2" size="lg" mt={6} mb={3} {...props} />,
  h2: (props: ComponentProps<'h2'>) => <Heading as="h3" size="md" mt={5} mb={2} {...props} />,
  h3: (props: ComponentProps<'h3'>) => <Heading as="h4" size="sm" mt={4} mb={2} {...props} />,
  p: (props: ComponentProps<'p'>) => <Text mb={4} lineHeight="1.8" {...props} />,
  a: (props: ComponentProps<'a'>) => <Link color="teal.500" isExternal {...props} />,
  img: (props: ComponentProps<'img'>) =>
    typeof props?.src === 'string'
      ? <Image src={props.src} alt={props.alt ?? ''} borderRadius="lg" my={4} />
      : null,
  code: (props: ComponentProps<'code'>) => <Code colorScheme="yellow" px={2} py={1} borderRadius="md" {...props} />,
  ul: (props: ComponentProps<'ul'>) => <Box as="ul" pl={5} mb={4} style={{ listStyleType: 'disc' }} {...props} />,
  ol: (props: ComponentProps<'ol'>) => <Box as="ol" pl={5} mb={4} style={{ listStyleType: 'decimal' }} {...props} />,
  li: (props: ComponentProps<'li'>) => <Box as="li" mb={2} {...props} />,
  blockquote: (props: ComponentProps<'blockquote'>) => <Box as="blockquote" borderLeft="4px solid #ccc" pl={4} color="gray.600" fontStyle="italic" my={4} {...props} />,
}

type BlogPostProps = {
  post: Post
  mdxSource: MDXRemoteSerializeResult
  alternatePost?: Post
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts()
  // Create paths for both the original slug and the full slug with language suffix
  const paths = posts.flatMap((post) => [
    { params: { slug: post.originalSlug || post.slug } },
    ...(post.slug !== (post.originalSlug || post.slug) ? [{ params: { slug: post.slug } }] : [])
  ])
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<BlogPostProps> = async ({ params }) => {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  
  if (!slug) return { notFound: true }

  // Get all posts to find the right one
  const posts = getAllPosts()
  
  // Try to find by originalSlug first (handles both language versions)
  let post = posts.find((p): p is Post => p.originalSlug === slug && p.language === 'en')
  
  // Fall back to exact slug match (handles -el versions)
  if (!post) {
    post = posts.find((p): p is Post => p.slug === slug)
  }

  if (!post) return { notFound: true }

  // Get alternate language post
  const alternatePost = getAlternateLanguagePost(post)

  const mdxSource = await serialize(post.content, { mdxOptions: { remarkPlugins: [remarkGfm] } })

  return {
    props: { 
      post, 
      mdxSource,
      ...(alternatePost ? { alternatePost } : {})
    },
  }
}

export default function BlogPost({ post, mdxSource, alternatePost }: BlogPostProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  // Handle language mismatch
  useEffect(() => {
    const currentLang = i18n.language || 'en'
    if (post.language !== currentLang && alternatePost) {
      // Redirect to the correct language version
      router.replace(`/blog/${alternatePost.slug}`)
    }
  }, [i18n.language, post.language, alternatePost, router])

  // Build an SEO-friendly meta description using the helper function
  const metaDescription = generateBlogMetaDescription(
    post.title,
    post.summary,
    post.content
  )

  const handleLanguageSwitch = () => {
    if (alternatePost) {
      router.push(`/blog/${alternatePost.slug}`)
      i18n.changeLanguage(alternatePost.language)
    } else {
      // If no alternate post exists, just change language and go to blog index
      const newLang = i18n.language === 'en' ? 'el' : 'en'
      i18n.changeLanguage(newLang)
      router.push('/blog')
    }
  }

  return (
    <Container maxW="4xl" py={10}>
      <Head>
        <title>{`${post.title} | Googlementor`}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Self-referencing canonical - each language version is its own canonical */}
        <link rel="canonical" href={`https://googlementor.com/blog/${post.slug}`} />
        
        {/* Add hreflang for current page */}
        <link 
          rel="alternate" 
          hrefLang={post.language} 
          href={`https://googlementor.com/blog/${post.slug}`} 
        />
        
        {/* Add hreflang for alternate language if it exists */}
        {alternatePost && (
          <link 
            rel="alternate" 
            hrefLang={alternatePost.language} 
            href={`https://googlementor.com/blog/${alternatePost.slug}`} 
          />
        )}
        
        {/* Add x-default to point to English version (or most appropriate default) */}
        <link 
          rel="alternate" 
          hrefLang="x-default" 
          href={`https://googlementor.com/blog/${post.language === 'en' ? post.slug : (alternatePost?.slug || post.slug)}`} 
        />
      </Head>
      
      {/* Navigation and Language Switcher */}
          <HStack justify="space-between" align="center" mb={6}>
            <NextLink href="/blog" passHref>
              <Button variant="ghost" size="sm">
                ← {t('blog.backToBlog', 'Back to Blog')}
              </Button>
            </NextLink>
            <HStack spacing={2}>
              {alternatePost ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLanguageSwitch}
                >
                  {t('blog.langSwitchLabel', { label: alternatePost.language === 'el' ? 'ΕΛ' : 'EN', defaultValue: alternatePost.language === 'el' ? 'ΕΛ' : 'EN' })}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newLang = i18n.language === 'en' ? 'el' : 'en'
                    i18n.changeLanguage(newLang)
                    router.push('/blog')
                  }}
                  opacity={0.6}
                >
                  {t('blog.langSwitchLabel', { label: i18n.language === 'en' ? 'ΕΛ' : 'EN', defaultValue: i18n.language === 'en' ? 'ΕΛ' : 'EN' })}
                </Button>
              )}
            </HStack>
          </HStack>

      {/* Alert if no translation available */}
      {!alternatePost && (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          {post.language === 'el' 
            ? t('blog.noEnglishVersion', 'This article is not available in English.')
            : t('blog.noGreekVersion', 'This article is not available in Greek.')}
        </Alert>
      )}
      
      <Heading as="h1" size="xl" mb={4}>{post.title}</Heading>
      <Text fontSize="sm" color="gray.500" mb={2}>
        {formatPostDate(post.date, post.language, { year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>
      <Text fontSize="md" color="gray.700" mb={4}>{post.summary}</Text>
      <Box className="blog-content">
        <MDXRemote {...mdxSource} components={MarkdownComponents} />
      </Box>
    </Container>
  )
}