'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
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
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import featureFlags from '../config/featureFlags.json';
import { dispatchAddToItinerary } from '../utils/itineraryEvents';
import { detectCategoryMatches } from '../lib/intent/categoryMatcher';

import islandsData from '../data/islands.json';
import productData from '../data/mapOptions.json';
import storeData from '../data/products.json';
import categoriesData from '../data/restaurantCategories.json';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  link: string;
  type: string;
  image?: string;
  locationImage?: string;
  keywords?: string[];
}

interface RestaurantCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

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
  const router = useRouter();
  const restaurantCategories = categoriesData as RestaurantCategory[];

  const openNearbyCategory = async (categoryId: string) => {
    const target = `/?category=${encodeURIComponent(categoryId)}`;

    try {
      await router.push(target);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = target;
      }
    }
  };

  const getSectionTitle = (type: string): string => {
    switch (type) {
      case 'islands':
        return t('search.sectionTitles.destinations', 'Destinations');
      case 'product':
        return t('search.sectionTitles.mapLists', 'Map lists');
      default:
        return type;
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const matchedCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const matches = detectCategoryMatches(searchQuery, 4);
    return matches
      .map((match) => restaurantCategories.find((category) => category.id === match.categoryId))
      .filter((category): category is RestaurantCategory => Boolean(category));
  }, [searchQuery, restaurantCategories]);

  const searchableData = useMemo<SearchResult[]>(() => [
    ...islandsData.map((item) => ({
      id: item.id,
      title: t(item.title) || item.title,
      description: t(item.description) || item.description,
      link: item.link,
      type: 'islands',
      image: item.img || '/placeholder.png',
      locationImage: item.locationImg || item.img || '/placeholder.png',
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
    ...(featureFlags.storeEnabled
      ? storeData.map((item) => ({
          id: item.id,
          title: t(item.name) || item.name,
          description: t(item.description) || item.description,
          link: item.link,
          type: 'store',
          image: item.image || '/placeholder.png',
          keywords: item.keywords || [],
        }))
      : []),
  ], [t]);

  const visibleSections = featureFlags.storeEnabled
    ? ['islands', 'product', 'store']
    : ['islands', 'product'];

  const getMapListTitle = (title: string) =>
    t('destination.itineraryMapTitle', {
      destination: title,
      defaultValue: '{{destination}} Points of Interest Map',
    });

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
      <Heading as="h1" size="xl" mb={6} textAlign="center" color="gray.800">
        {t('search.title')}
      </Heading>
      
      <InputGroup mb={6} onClick={handleFocus} w="100%" maxW="600px" mx="auto">
        <Input
          ref={searchInputRef}
          placeholder={t('search.placeholder', 'Search...')}
          aria-label={t('search.inputAriaNoStore', 'Search input for destinations and map lists')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onClick={handleFocus}
          id="search"
          name="search"
          size="sm"
          focusBorderColor="blue.500"
          fontSize={{ base: 'sm', md: 'md' }}
          py={{ base: 2, md: 3 }}
          pr="2.5rem"
        />
        <InputRightElement width="2.5rem">
          <IconButton
            aria-label={t('search.executeSearchAria', 'Execute search')}
            icon={<SearchIcon />}
            size="sm"
            variant="ghost"
            onClick={() => debouncedSearch(searchQuery)}
          />
        </InputRightElement>
      </InputGroup>

      <VStack spacing={6} align="stretch">
        {matchedCategories.length > 0 && (
          <Box>
            <Heading as="h2" size="md" mb={2} color="teal.600" textAlign="center">
              {t('search.categorySuggestions', 'Category suggestions')}
            </Heading>
            <Text textAlign="center" color="gray.600" fontSize="sm" mb={4}>
              {t('search.categorySuggestionsHelp', 'Pick a category to find nearby curated places from your current location.')}
            </Text>

            <Grid
              templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
              gap={{ base: 3, sm: 4 }}
              mb={2}
            >
              {matchedCategories.map((category) => (
                <GridItem
                  key={`intent-category-${category.id}`}
                  bg="teal.50"
                  border="1px solid"
                  borderColor="teal.200"
                  borderRadius="md"
                  p={4}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="2xl" lineHeight="1">{category.icon}</Text>
                    <Text fontWeight="bold" color="gray.800">
                      {t(`categories.${category.id}`, category.name)}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {t(`categories.descriptions.${category.id}`, category.description)}
                    </Text>
                    <Button
                      onClick={() => {
                        void openNearbyCategory(category.id);
                      }}
                      colorScheme="teal"
                      size="sm"
                      width="full"
                    >
                      {t('search.openNearbyCategory', 'Search this category near me')}
                    </Button>
                  </VStack>
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}

        {visibleSections.map((type) => {
          const sectionResults = filteredResults.filter((item) => item.type === type);
          if (sectionResults.length === 0) return null;

          return (
            <Box key={type}>
              <Heading as="h2" size="md" mb={2} color="blue.500" textAlign="center">
                {getSectionTitle(type)}
              </Heading>
              <Grid
                templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
                gap={{ base: 3, sm: 4, md: 6 }}
              >
                {sectionResults.map((item) => {
                  const isExternal = /^https?:\/\//i.test(item.link);
                  return (
                  <GridItem
                    key={item.id}
                    bg="white"
                    shadow="md"
                    borderRadius="md"
                    overflow="hidden"
                    _hover={{ shadow: 'lg' }}
                  >
                    <Box p={{ base: 2, sm: 3 }}>
                      <Link
                        href={item.link}
                        _hover={{ textDecoration: 'none' }}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                      >
                          {item.type === 'islands' ? (
                            <Box
                              display="grid"
                              gridTemplateColumns="1fr"
                              gridTemplateRows="minmax(0, 3fr) minmax(0, 2fr)"
                              gap={1.5}
                              mb={2}
                              bg="gray.50"
                              borderRadius="md"
                              p={1.5}
                              border="1px solid"
                              borderColor="gray.200"
                            >
                              <Image
                                src={item.image}
                                alt={item.title || t('search.resultImageAlt', 'Search result image')}
                                w="100%"
                                h={{ base: '92px', sm: '104px', md: '116px' }}
                                objectFit="cover"
                                borderRadius="md"
                              />
                              <Box position="relative" bg="gray.200" borderRadius="md" overflow="hidden">
                                <Image
                                  position="absolute"
                                  inset={0}
                                  src={item.locationImage || item.image}
                                  alt=""
                                  aria-hidden="true"
                                  w="100%"
                                  h={{ base: '64px', sm: '70px', md: '76px' }}
                                  objectFit="cover"
                                  filter="blur(6px)"
                                  transform="scale(1.04)"
                                  opacity={0.38}
                                />
                                <Image
                                  src={item.locationImage || item.image}
                                  alt={t('islands.locationScreenshotAlt', {
                                    title: item.title,
                                    defaultValue: '{{title}} locations screenshot',
                                  })}
                                  position="relative"
                                  zIndex={1}
                                  w="100%"
                                  h={{ base: '64px', sm: '70px', md: '76px' }}
                                  objectFit="contain"
                                  p={1}
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor="gray.200"
                                />
                                <Text
                                  position="absolute"
                                  top="6px"
                                  left="6px"
                                  fontSize="10px"
                                  fontWeight="semibold"
                                  px="1.5"
                                  py="0.5"
                                  bg="gray.800"
                                  color="white"
                                  borderRadius="sm"
                                  letterSpacing="wide"
                                  lineHeight="1.1"
                                >
                                  {t('destination.mapPreview', 'Map preview')}
                                </Text>
                              </Box>
                            </Box>
                          ) : (
                            <Image
                              src={item.image}
                              alt={item.title || t('search.resultImageAlt', 'Search result image')}
                              boxSize={{ base: '60px', sm: '75px', md: '100px' }}
                              objectFit="cover"
                              borderRadius="md"
                              mb={2}
                            />
                          )}
                          <Text
                            fontWeight="semibold"
                            mb={1.5}
                            noOfLines={1}
                            letterSpacing="tight"
                            lineHeight="short"
                            fontSize={{ base: 'sm', sm: 'sm', md: 'md' }}
                          >
                            {item.title}
                          </Text>
                          <Text
                            color="gray.600"
                            noOfLines={2}
                            lineHeight="1.45"
                            fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
                          >
                            {item.description}
                          </Text>
                      </Link>

                      <Box mt={2} display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={2}>
                        <Button
                          as={Link}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="xs"
                          colorScheme="blue"
                          variant="solid"
                          minH="44px"
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          fontWeight="semibold"
                          letterSpacing="tight"
                          whiteSpace="normal"
                          lineHeight="short"
                          textAlign="center"
                        >
                          {t('destinationSearch.openCuratedMapShort', 'Map')}
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="teal"
                          variant="outline"
                          minH="44px"
                          px={4}
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          fontWeight="semibold"
                          letterSpacing="tight"
                          whiteSpace="normal"
                          lineHeight="short"
                          textAlign="center"
                          onClick={() =>
                            dispatchAddToItinerary({
                              id: item.id,
                              name: item.type === 'islands' ? getMapListTitle(item.title) : item.title,
                              type: item.type === 'islands' ? 'guide' : item.type === 'product' ? 'guide' : 'custom',
                              url: item.link,
                              notes:
                                item.type === 'islands'
                                  ? t('destination.itineraryMapNote', {
                                      destination: item.title,
                                      defaultValue:
                                        'Map stop: this Google Maps list highlights the most important places in {{destination}}. Open it anytime to browse must-see spots and plan your route.',
                                    })
                                  : undefined,
                            })
                          }
                        >
                          {t('place.addToItinerary', 'Add to itinerary')}
                        </Button>
                      </Box>
                    </Box>
                  </GridItem>
                  );
                })}
              </Grid>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default SearchPage;
