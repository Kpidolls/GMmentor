import { GetStaticProps } from 'next'
import { getAllPosts, Post } from '../../lib/posts'
import Link from 'next/link'
import Head from 'next/head'
import { Box, Heading, Text, VStack, Container } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

type BlogProps = {
  posts: Post[]
}

export const getStaticProps: GetStaticProps<BlogProps> = async () => {
  const posts = getAllPosts()
  return { props: { posts } }
}
export default function Blog({ posts }: BlogProps) {
  const { t } = useTranslation()
  return (
    <>
      <Head>
        <title>{t('meta.blogTitle')}</title>
        <meta 
          name="description" 
          content={t('meta.blogDescription')} 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/blog" />
      </Head>
      <Container maxW="4xl" py={10}>
      <Heading as="h1" size="xl" mb={8}>Blog</Heading>
      <VStack spacing={8} align="stretch">
        {posts.map((post) => (
          <Box key={post.slug} p={5} shadow="md" borderWidth="1px" borderRadius="xl">
            <Link href={`/blog/${post.slug}`} passHref>
              <Heading as="h2" size="md" mb={2}>{t(post.title)}</Heading>
            </Link>
            <Text fontSize="sm" color="gray.500">
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
            <Box mt={2} color="gray.700">
               <Text>{t(post.summary)}</Text>
            </Box>
          </Box>
        ))}
      </VStack>
    </Container>
    </>
  )
}
