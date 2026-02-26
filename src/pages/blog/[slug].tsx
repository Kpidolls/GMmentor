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
import { useEffect, useMemo, useState } from 'react'
import NextLink from 'next/link'
import { generateBlogMetaDescription, getBlogMetaDescriptionBySlug } from '../../config/metaDescriptions'
import { formatPostDate } from '../../utils/dateUtils'

const MarkdownComponents = {
  h1: (props: ComponentProps<'h1'>) => <Heading as="h2" size="lg" mt={6} mb={3} {...props} />,
  h2: (props: ComponentProps<'h2'>) => <Heading as="h3" size="md" mt={5} mb={2} {...props} />,
  h3: (props: ComponentProps<'h3'>) => <Heading as="h4" size="sm" mt={4} mb={2} {...props} />,
  p: (props: ComponentProps<'p'>) => <Text mb={4} lineHeight="1.8" {...props} />,
  a: (props: ComponentProps<'a'>) => <Link color="teal.500" isExternal {...props} />,
  figure: (props: ComponentProps<'figure'>) => <Box as="figure" my={7} mx="auto" maxW="760px" {...props} />,
  figcaption: (props: ComponentProps<'figcaption'>) => (
    <Text as="figcaption" mt={2} fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.6" {...props} />
  ),
  img: (props: ComponentProps<'img'>) =>
    typeof props?.src === 'string'
      ? (
        <Image
          src={props.src}
          alt={props.alt ?? ''}
          borderRadius="xl"
          my={5}
          w="100%"
          maxW="760px"
          mx="auto"
          maxH="460px"
          objectFit="cover"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="md"
          loading="lazy"
        />
      )
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

type ShareAudience = 'foodies' | 'families' | 'adventurers' | 'culture' | 'budget' | 'default'
type ShareContext = 'default' | 'food' | 'culture' | 'transport' | 'itinerary' | 'nightlife' | 'islands' | 'budget'

function getShareAudienceKey(tags?: string[]): ShareAudience {
  if (!tags?.length) return 'default'

  const normalized = tags.map((tag) => tag.toLowerCase())

  const includesAny = (terms: string[]) =>
    terms.some((term) => normalized.some((tag) => tag.includes(term)))

  if (includesAny(['φαγη', 'food', 'restaurant', 'brunch', 'coffee', 'souvenir'])) return 'foodies'
  if (includesAny(['family', 'kid', 'παιδ', 'οικογεν'])) return 'families'
  if (includesAny(['hiking', 'πεζοπο', 'trip', 'δρομή', 'island', 'νησ'])) return 'adventurers'
  if (includesAny(['history', 'culture', 'μουσ', 'museum', 'acropolis', 'ακρόπο'])) return 'culture'
  if (includesAny(['budget', 'cheap', 'οικονομ', 'value'])) return 'budget'

  return 'default'
}

function getShareContextKey(post: Post): ShareContext {
  const searchableText = `${post.slug} ${post.title} ${post.summary} ${(post.tags || []).join(' ')}`.toLowerCase()

  const containsAny = (terms: string[]) => terms.some((term) => searchableText.includes(term))

  if (containsAny(['airport', 'transfer', 'metro', 'bus', 'ferry', 'layover', 'flight', 'αεροδρ', 'μεταφορ'])) return 'transport'
  if (containsAny(['nightlife', 'bar', 'rooftop', 'music', 'bouzouk', 'νυχτ', 'μπαρ', 'μουσικ'])) return 'nightlife'
  if (containsAny(['island', 'santorini', 'mykonos', 'crete', 'naxos', 'paros', 'cyclades', 'νησ', 'κυκλαδ'])) return 'islands'
  if (containsAny(['food', 'restaurant', 'taverna', 'brunch', 'coffee', 'souvlaki', 'gyros', 'dessert', 'φαγη', 'ταβερ', 'καφε', 'γλυκ'])) return 'food'
  if (containsAny(['acropolis', 'museum', 'history', 'archae', 'monastery', 'church', 'culture', 'ακρόπο', 'μουσεί', 'ιστορ', 'μονή', 'πολιτισ'])) return 'culture'
  if (containsAny(['budget', 'cheap', 'free', 'value', 'οικονομ', 'δωρεάν'])) return 'budget'
  if (containsAny(['guide', 'itinerary', 'day trip', 'things to do', 'tips', 'weekend', 'δρομή', 'οδηγ', 'τι να κάν', 'συμβουλ'])) return 'itinerary'

  return 'default'
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
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  const shareUrl = useMemo(() => `https://googlementor.com/blog/${post.slug}`, [post.slug])
  const shareContextKey = useMemo(() => getShareContextKey(post), [post])
  const audienceKey = useMemo(() => getShareAudienceKey(post.tags), [post.tags])
  const audienceText = t(`blog.share.audience.${audienceKey}`, {
    defaultValue: t('blog.share.audience.default', 'travelers planning a trip to Greece'),
  })
  const shareTitle = t(`blog.share.context.${shareContextKey}.title`, {
    defaultValue: t('blog.share.title', 'Share this guide'),
  })
  const shareSubtitle = t(`blog.share.context.${shareContextKey}.subtitle`, {
    defaultValue: t('blog.share.subtitle', 'Know someone who would find this useful? Send it with one click.'),
  })
  const contextAudienceText = t(`blog.share.context.${shareContextKey}.audience`, {
    defaultValue: audienceText,
  })
  const socialText = useMemo(
    () => `${post.title} — ${post.summary || t('blog.share.messageDefault', 'Useful Greece travel guide from Googlementor.')}`,
    [post.title, post.summary, t]
  )
  const shareMessage = useMemo(
    () => `${socialText}\n\n${t('blog.share.relevantFor', 'Relevant for')}: ${contextAudienceText}`,
    [socialText, contextAudienceText, t]
  )
  const encodedShareUrl = useMemo(() => encodeURIComponent(shareUrl), [shareUrl])
  const encodedSocialText = useMemo(() => encodeURIComponent(socialText), [socialText])
  const socialLinks = useMemo(
    () => [
      {
        key: 'x',
        href: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedSocialText}`,
        label: t('blog.share.social.x', 'X'),
      },
      {
        key: 'facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
        label: t('blog.share.social.facebook', 'Facebook'),
      },
      {
        key: 'whatsapp',
        href: `https://wa.me/?text=${encodeURIComponent(`${socialText} ${shareUrl}`)}`,
        label: t('blog.share.social.whatsapp', 'WhatsApp'),
      },
      {
        key: 'linkedin',
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
        label: t('blog.share.social.linkedin', 'LinkedIn'),
      },
    ],
    [encodedShareUrl, encodedSocialText, shareUrl, socialText, t]
  )

  // Handle language mismatch
  useEffect(() => {
    const currentLang = i18n.language || 'en'
    if (post.language !== currentLang && alternatePost) {
      // Redirect to the correct language version
      router.replace(`/blog/${alternatePost.slug}`)
    }
  }, [i18n.language, post.language, alternatePost, router])

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  // Build an SEO-friendly meta description using the helper function
  const metaDescription = getBlogMetaDescriptionBySlug(post.slug) || generateBlogMetaDescription(
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

  const handleCopyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  const handleNativeShare = async () => {
    if (!canNativeShare || typeof navigator === 'undefined') return

    try {
      await navigator.share({
        title: post.title,
        text: shareMessage,
        url: shareUrl,
      })
    } catch {
      // no-op (user canceled or share failed)
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

      <Box mt={{ base: 10, md: 12 }} mb={2}>
        <Box h="1px" bg="gray.200" mb={{ base: 5, md: 6 }} />
      </Box>

      <Box mb={8} maxW="3xl" mx="auto" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="blue.100" bgGradient="linear(to-br, white, blue.50)" boxShadow="md">
        <HStack justify="space-between" align="start" flexWrap="wrap" spacing={{ base: 3, md: 4 }}>
          <Box flex="1" minW={{ base: '100%', md: '250px' }}>
            <Heading as="h2" size="sm" color="blue.800" mb={1}>
              {shareTitle}
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={1}>
              {shareSubtitle}
            </Text>
            <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={2}>
              {t('blog.share.relevantFor', 'Relevant for')}: {contextAudienceText}
            </Text>
            <Link href={shareUrl} isExternal fontSize="xs" color="gray.600" display="inline-block" bg="white" border="1px solid" borderColor="gray.200" px={{ base: 2, md: 3 }} py={{ base: 1.5, md: 2 }} borderRadius="md" maxW="100%" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {shareUrl}
            </Link>

            <Text fontSize="xs" color="gray.500" mt={3} mb={1}>
              {t('blog.share.shareOn', 'Share on')}
            </Text>
            <HStack spacing={2} flexWrap="wrap" align="center">
              {socialLinks.map((social) => (
                <Link
                  key={social.key}
                  href={social.href}
                  isExternal
                  aria-label={`${t('blog.share.shareOn', 'Share on')} ${social.label}`}
                  fontSize="xs"
                  fontWeight="medium"
                  color="blue.700"
                  bg="white"
                  border="1px solid"
                  borderColor="blue.100"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  _hover={{ textDecoration: 'none', bg: 'blue.100' }}
                >
                  {social.label}
                </Link>
              ))}
            </HStack>
          </Box>

          <HStack spacing={2} alignSelf={{ base: 'stretch', md: 'center' }} w={{ base: '100%', md: 'auto' }} justify={{ base: 'flex-start', md: 'flex-end' }}>
            <Button size="sm" colorScheme="blue" onClick={handleCopyLink} w={{ base: '100%', sm: 'auto' }} aria-label={t('blog.share.copy', 'Copy link')}>
              {copied ? t('blog.share.copied', 'Copied') : t('blog.share.copy', 'Copy link')}
            </Button>
            {canNativeShare && (
              <Button size="sm" variant="outline" colorScheme="blue" onClick={handleNativeShare} w={{ base: '100%', sm: 'auto' }} aria-label={t('blog.share.native', 'Share')}>
                {t('blog.share.native', 'Share')}
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>
    </Container>
  )
}