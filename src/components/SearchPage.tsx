'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Grid,
  GridItem,
  Text,
  Link,
  VStack,
  Image,
  Heading,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';

import islandsData from '../data/islands.json';
import productData from '../data/mapOptions.json';
import storeData from '../data/products.json';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  link: string;
  type: string;
  image?: string;
}

const sectionTitles: Record<string, string> = {
  islands: 'Greek Islands',
  product: 'Map lists',
  store: 'Travel Gear',
};

// Basic Greek-to-Latin transliteration map
const greekToLatinMap: Record<string, string> = {
  α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i',
  κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's',
  τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o',
  ά: 'a', έ: 'e', ή: 'i', ί: 'i', ό: 'o', ύ: 'y', ώ: 'o', ς: 's',
};

const normalizeText = (text: string): string => {
  const lower = text.toLowerCase();
  return lower.replace(/[\u0370-\u03FF\u1F00-\u1FFF]/g, (char) => greekToLatinMap[char] || char);
};

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchableData = useMemo<SearchResult[]>(() => [
    ...islandsData.map((item) => ({
      id: item.id,
      title: t(item.title),
      description: t(item.description),
      link: item.link,
      type: 'islands',
      image: item.img || '/placeholder.png',
    })),
    ...productData.map((item) => ({
      id: item.id,
      title: t(item.title),
      description: t(item.description),
      link: item.link,
      type: 'product',
      image: item.img || '/placeholder.png',
    })),
    ...storeData.map((item) => ({
      id: item.id,
      title: t(item.name),
      description: t(item.description),
      link: item.link,
      type: 'store',
      image: item.image || '/placeholder.png',
    })),
  ], [t]);

  const debouncedSearch = useMemo(() =>
    debounce((query: string) => {
      const normalizedQuery = normalizeText(query.toLowerCase());
      const results = searchableData.filter((item) => {
        const titleNorm = normalizeText(item.title.toLowerCase());
        const descNorm = normalizeText(item.description.toLowerCase());
        return titleNorm.includes(normalizedQuery) || descNorm.includes(normalizedQuery);
      });
      setFilteredResults(results);
    }, 300)
  , [searchableData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleFocus = () => {
    searchInputRef.current?.focus();
    setFilteredResults(searchableData);
  };

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  return (
    <Box maxW="100%" px={{ base: 3, md: 4 }} py={{ base: 4, md: 8 }}>
      <InputGroup mb={6} onClick={handleFocus} w="100%" maxW="600px" mx="auto">
        <Input
          ref={searchInputRef}
          placeholder={t('search.placeholder', 'Search...')}
          aria-label="Search input"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          size="sm"
          focusBorderColor="blue.500"
          fontSize={{ base: 'sm', md: 'md' }}
          py={{ base: 2, md: 3 }}
          pr="2.5rem"
        />
        <InputRightElement width="2.5rem">
          <IconButton
            aria-label="Search"
            icon={<SearchIcon />}
            size="sm"
            variant="ghost"
            onClick={() => debouncedSearch(searchQuery)}
          />
        </InputRightElement>
      </InputGroup>

      <VStack spacing={6} align="stretch">
        {['islands', 'product', 'store'].map((type) => {
          const sectionResults = filteredResults.filter((item) => item.type === type);
          if (sectionResults.length === 0) return null;

          return (
            <Box key={type}>
              <Heading as="h2" size="md" mb={2} color="blue.500" textAlign="center">
                {sectionTitles[type]}
              </Heading>
              <Grid
                templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
                gap={{ base: 3, sm: 4, md: 6 }}
              >
                {sectionResults.map((item) => (
                  <NextLink key={item.id} href={item.link} passHref>
                    <Link
                      _hover={{ textDecoration: 'none' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GridItem
                        bg="white"
                        shadow="md"
                        borderRadius="md"
                        overflow="hidden"
                        _hover={{ shadow: 'lg' }}
                      >
                        <Box p={{ base: 2, sm: 3 }}>
                          <Image
                            src={item.image}
                            alt={item.title || 'Search result image'}
                            boxSize={{ base: '60px', sm: '75px', md: '100px' }}
                            objectFit="cover"
                            borderRadius="md"
                            mb={2}
                          />
                          <Text
                            fontWeight="bold"
                            mb={1}
                            noOfLines={1}
                            fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                          >
                            {item.title}
                          </Text>
                          <Text
                            color="gray.600"
                            noOfLines={2}
                            fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
                          >
                            {item.description}
                          </Text>
                        </Box>
                      </GridItem>
                    </Link>
                  </NextLink>
                ))}
              </Grid>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default SearchPage;
