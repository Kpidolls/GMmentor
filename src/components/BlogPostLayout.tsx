import { useTranslation } from 'react-i18next';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Box, Link, Image } from '@chakra-ui/react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

type Props = {
  titleKey: string
  paragraphs: string[]
}
const components = {
  Box,
  Heading,
  Text,
  Link,
  Image,
};

export function BlogPost({ source }: { source: MDXRemoteSerializeResult }) {
  return <MDXRemote {...source} components={components} />;
}
export default function BlogPostLayout({ titleKey, paragraphs }: Props) {
  const { t } = useTranslation();

  return (
    <Container maxW="4xl" py={10}>
      <Heading as="h1" mb={6}>{t(titleKey)}</Heading>
      {paragraphs.map((pKey) => (
        <Text key={pKey} mb={4} lineHeight="1.8">
          {t(pKey)}
        </Text>
      ))}
    </Container>
  );
}
