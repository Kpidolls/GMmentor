import { GetStaticProps } from 'next'
import { Post, getAllPosts } from '../../lib/posts'
import Link from 'next/link'
import Head from 'next/head'
import { Box, Heading, Text, Container, HStack, Button, Grid, GridItem, Image, Badge, Flex, Tag, TagLabel } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { metaDescriptions } from '../../config/metaDescriptions'

type BlogListPost = Omit<Post, 'content'> & {
  image: string
  readTime: number
}

type BlogProps = {
  allPosts: BlogListPost[]
}

// Helper function to extract first image from MDX content
const extractFirstImage = (content: string): string | null => {
  // Look for image patterns in MDX content
  const imagePatterns = [
    /!\[.*?\]\((.*?)\)/,  // Markdown image syntax
    /<img[^>]+src="([^"]+)"/,  // HTML img tag
    /<Image[^>]+src="([^"]+)"/,  // React Image component
    /src="([^"]+\.(?:jpg|jpeg|png|webp|gif))"/i  // Any src with image extension
  ];
  
  for (const pattern of imagePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Handle relative paths
      const imagePath = match[1].startsWith('/') ? match[1] : `/${match[1]}`;
      return imagePath;
    }
  }
  
  return null;
};

// Fallback images based on content/tags
const getFallbackImage = (post: Post): string => {
  const title = post.title.toLowerCase();
  const summary = post.summary?.toLowerCase() || '';
  const content = `${title} ${summary}`;
  
  if (content.includes('acropolis') || content.includes('ακρόπολη')) {
    return '/assets/images/athens.webp';
  }
  if (content.includes('island') || content.includes('νησί')) {
    return '/assets/images/astypalea.webp';
  }
  if (content.includes('food') || content.includes('restaurant') || content.includes('φαγητό')) {
    return '/assets/images/eat.webp';
  }
  if (content.includes('travel') || content.includes('ταξίδι')) {
    return '/assets/images/family.webp';
  }
  
  return '/assets/images/newlogo1.webp'; // Default fallback
};

export const getStaticProps: GetStaticProps<BlogProps> = async () => {
  const allPosts = getAllPosts().map((post) => {
    const image = extractFirstImage(post.content) || getFallbackImage(post)
    const readTime = Math.max(1, Math.ceil(post.content.length / 1000))
    const { content, ...rest } = post

    return {
      ...rest,
      image,
      readTime
    }
  })
  return { props: { allPosts } }
}

export default function Blog({ allPosts }: BlogProps) {
  const { t, i18n } = useTranslation()
  const currentLanguage = useMemo(() => {
    const lang = i18n.resolvedLanguage || i18n.language || 'en'
    return lang.split('-')[0]
  }, [i18n.language, i18n.resolvedLanguage])

  const posts = useMemo(
    () => allPosts.filter((post) => post.language === currentLanguage),
    [allPosts, currentLanguage]
  )

  return (
    <>
      <Head>
        <title>{t('meta.blogTitle')}</title>
        <meta 
          name="description" 
          content={metaDescriptions.blog} 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/blog" />
      </Head>
      
      <Box bg="gray.50" minH="100vh">
        <Container maxW="7xl" py={10}>
          {/* Header Section */}
          <Box textAlign="center" mb={12}>
            <Heading 
              as="h1" 
              size="2xl" 
              mb={4}
              color="blue.700"
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
              fontWeight="extrabold"
              lineHeight="1.2"
              pb={1}
              sx={{
                '@supports not (background-clip: text)': {
                  color: 'blue.700'
                },
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Blog
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto" mb={6}>
              Discover Greece through our curated guides, travel tips, and local insights
            </Text>
            <Box h="1" w="32" bg="blue.500" mx="auto" borderRadius="full" />
          </Box>

          {/* Language Toggle and Stats */}
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
              </Badge>
              <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="sm">
                {currentLanguage === 'en' ? 'English' : 'Ελληνικά'}
              </Badge>
            </HStack>
            <Button 
              variant="outline" 
              size="sm"
              colorScheme="blue"
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'el' : 'en')}
              borderRadius="full"
              px={6}
            >
              {i18n.language === 'en' ? '🇬🇷 ΕΛ' : '🇺🇸 EN'}
            </Button>
          </Flex>

          {/* Blog Posts Grid */}
          {posts.length === 0 ? (
            <Box textAlign="center" py={16}>
              <Text fontSize="lg" color="gray.500">
                No articles available in this language yet.
              </Text>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
              {posts.map((post) => (
                <GridItem key={post.slug}>
                  {/* Wrap entire card in Link for consistent clickability */}
                  <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
                    <Box
                      as="a"
                      className="group"
                      bg="white"
                      borderRadius="2xl"
                      overflow="hidden"
                      shadow="lg"
                      transition="all 0.3s"
                      _hover={{ 
                        transform: "translateY(-4px)", 
                        shadow: "2xl",
                        borderColor: "blue.200",
                        textDecoration: "none"
                      }}
                      _focus={{ 
                        outline: "2px solid",
                        outlineColor: "blue.500",
                        outlineOffset: "2px"
                      }}
                      cursor="pointer"
                      border="1px solid"
                      borderColor="gray.100"
                      h="full"
                      display="flex"
                      flexDirection="column"
                      role="link"
                      tabIndex={0}
                    >
                      {/* Image Section */}
                      <Box position="relative" overflow="hidden" h="200px" pointerEvents="none">
                        <Image
                          src={post.image}
                          alt={post.title}
                          w="full"
                          h="full"
                          objectFit="cover"
                          transition="transform 0.3s"
                          _hover={{ transform: "scale(1.05)" }}
                          fallbackSrc="/assets/images/newlogo1.webp"
                          pointerEvents="none"
                        />
                        {/* Reading time badge */}
                        <Badge
                          position="absolute"
                          top={3}
                          right={3}
                          colorScheme="blackAlpha"
                          borderRadius="full"
                          px={2}
                          py={1}
                          fontSize="xs"
                          bg="blackAlpha.700"
                          color="white"
                          pointerEvents="none"
                        >
                          📖 {post.readTime} min read
                        </Badge>
                      </Box>

                        {/* Content Section */}
                        <Box p={6} flex="1" display="flex" flexDirection="column">
                          {/* Date */}
                          <Text fontSize="sm" color="gray.500" mb={2} pointerEvents="none">
                            📅 {new Date(post.date).toLocaleDateString(i18n.language === 'el' ? 'el-GR' : 'en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Text>

                          {/* Title - Fully clickable */}
                          <Heading 
                            as="h2" 
                            size="md" 
                            mb={3} 
                            lineHeight="1.4"
                            color="gray.800"
                            _hover={{ color: 'blue.600' }}
                            transition="color 0.2s"
                            noOfLines={2}
                            pointerEvents="none"
                          >
                            {post.title}
                          </Heading>

                          {/* Summary - Fully clickable */}
                          <Text 
                            color="gray.600" 
                            fontSize="sm" 
                            lineHeight="1.6"
                            flex="1"
                            noOfLines={3}
                            mb={4}
                            _hover={{ color: 'gray.700' }}
                            transition="color 0.2s"
                            pointerEvents="none"
                          >
                            {post.summary}
                          </Text>

                          {/* Tags from post tags */}
                          {post.tags && post.tags.length > 0 && (
                            <Flex gap={1} flexWrap="wrap" mb={3} pointerEvents="none">
                              {post.tags.slice(0, 2).map((tag, index) => (
                                <Tag key={index} size="sm" colorScheme="blue" variant="subtle" borderRadius="full">
                                  <TagLabel fontSize="xs" isTruncated maxW="20">
                                    {tag}
                                  </TagLabel>
                                </Tag>
                              ))}
                            </Flex>
                          )}

                          {/* Read More indicator */}
                          <Flex align="center" justify="space-between" mt="auto">
                            <Text 
                              fontSize="sm" 
                              color="blue.600" 
                              fontWeight="medium"
                              _hover={{ color: 'blue.700' }}
                              transition="color 0.2s"
                            >
                              {t('blog.readMore', 'Read More')} →
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {post.language === 'el' ? '🇬🇷' : '🇬🇧'}
                            </Text>
                          </Flex>
                        </Box>
                    </Box>
                  </Link>
                </GridItem>
              ))}
            </Grid>
          )}

          {/* Call to Action */}
          <Box textAlign="center" mt={16} py={12} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
            <Heading size="lg" mb={4} color="blue.800">
              Ready to Explore Greece?
            </Heading>
            <Text color="blue.600" mb={6} maxW="2xl" mx="auto">
              Discover authentic restaurants, hidden gems, and local favorites with our curated maps and guides.
            </Text>
            <Button 
              as={Link}
              href="/"
              colorScheme="blue" 
              size="lg" 
              borderRadius="full"
              px={8}
              _hover={{ transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              Start Exploring 🗺️
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  )
}
