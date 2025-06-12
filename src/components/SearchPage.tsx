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
  keywords?: string[];
}

const sectionTitles: Record<string, string> = {
  islands: 'Destinations',
  product: 'Map lists',
  store: 'Travel Gear',
};

const greekToLatinMap: Record<string, string[]> = {
  α: ['a'], β: ['v', 'b'], γ: ['g'], δ: ['d'], ε: ['e'], ζ: ['z'], η: ['i', 'e'], θ: ['th'], ι: ['i','y'],
  κ: ['k'], λ: ['l'], μ: ['m'], ν: ['n'], ξ: ['x','ks'], ο: ['o'], π: ['p'], ρ: ['r'], σ: ['s'],
  τ: ['t'], υ: ['y', 'i'], φ: ['f'], χ: ['ch', 'h', 'x'], ψ: ['ps'], ω: ['o'],
  ά: ['a'], έ: ['e'], ή: ['i'], ί: ['i'], ό: ['o'], ύ: ['y'], ώ: ['o'], ς: ['s'],
};

const normalizeText = (text: string): string => {
  const lower = text.toLowerCase();
  return Array.from(lower).map((char) => {
    const transliterations = greekToLatinMap[char];
    return transliterations ? transliterations[0] : char; // Use the first transliteration or the original character
  }).join('');
};

const SearchPage = ({ focusOnMount = false }: { focusOnMount?: boolean }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchableData = useMemo<SearchResult[]>(() => [
    ...islandsData.map((item) => ({
      id: item.id,
      title: t(item.title) || item.title,
      description: t(item.description) || item.description,
      link: item.link,
      type: 'islands',
      image: item.img || '/placeholder.png',
      keywords: item.keywords || [],
    })),
    ...productData.map((item) => ({
      id: item.id,
      title: t(item.title) || item.title,
      description: t(item.description) || item.description,
      link: item.link,
      type: 'product',
      image: item.img || '/placeholder.png',
      keywords: item.keywords || [],
    })),
    ...storeData.map((item) => ({
      id: item.id,
      title: t(item.name) || item.name,
      description: t(item.description) || item.description,
      link: item.link,
      type: 'store',
      image: item.image || '/placeholder.png',
      keywords: item.keywords || [],
    })),
  ], [t]);

  const debouncedSearch = useMemo(() =>
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredResults([]);
        return;
      }

      const normalizedQuery = normalizeText(query.toLowerCase());
      const results = searchableData.filter((item) => {
        const titleNorm = normalizeText(item.title.toLowerCase());
        const descNorm = normalizeText(item.description.toLowerCase());
        const keywordsNorm = (item.keywords || []).map((keyword) =>
          normalizeText(keyword.toLowerCase())
        );
        return (
          titleNorm.includes(normalizedQuery) ||
          descNorm.includes(normalizedQuery) ||
          keywordsNorm.some((keyword) => keyword.includes(normalizedQuery))
        );
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
    if (!searchQuery.trim()) {
      setFilteredResults(searchableData);
    }
  };

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    if (focusOnMount && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusOnMount]);

  return (
    <Box maxW="100%" px={{ base: 3, md: 4 }} py={{ base: 4, md: 8 }}>
      <InputGroup mb={6} onClick={handleFocus} w="100%" maxW="600px" mx="auto">
        <Input
          ref={searchInputRef}
          placeholder={t('search.placeholder', 'Search...')}
          aria-label="Search input for destinations, maps, or travel gear"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onClick={handleFocus}
          size="sm"
          focusBorderColor="blue.500"
          fontSize={{ base: 'sm', md: 'md' }}
          py={{ base: 2, md: 3 }}
          pr="2.5rem"
        />
        <InputRightElement width="2.5rem">
          <IconButton
            aria-label="Execute search"
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
                  <GridItem
                    key={item.id}
                    bg="white"
                    shadow="md"
                    borderRadius="md"
                    overflow="hidden"
                    _hover={{ shadow: 'lg' }}
                  >
                    <NextLink href={item.link} passHref>
                      <Link
                        _hover={{ textDecoration: 'none' }}
                        target="_blank"
                        rel="noopener noreferrer"
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
                      </Link>
                    </NextLink>
                  </GridItem>
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
