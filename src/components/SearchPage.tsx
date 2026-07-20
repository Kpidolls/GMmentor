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
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import featureFlags from '../config/featureFlags.json';
import { dispatchAddToItinerary } from '../utils/itineraryEvents';
import { detectCategoryMatches } from '../lib/intent/categoryMatcher';
import type { EntityRecord } from '../lib/entities';

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
  kind?: EntityRecord['kind'];
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

const getPlaceInitials = (title: string): string => {
  const parts = title
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  const firstPart = parts[0] || '';
  const secondPart = parts[1] || '';

  if (parts.length === 1) return firstPart.slice(0, 2).toUpperCase();

  return `${firstPart.slice(0, 1)}${secondPart.slice(0, 1)}`.toUpperCase();
};

type SearchPageProps = {
  focusOnMount?: boolean;
  placeEntities?: EntityRecord[];
};

const SearchPage = ({ focusOnMount = false, placeEntities = [] }: SearchPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
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
      case 'places':
        return t('search.sectionTitles.places', 'Places');
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
    ...placeEntities.map((entity) => ({
      id: entity.id,
      title: entity.name,
      description: [entity.address, entity.region].filter(Boolean).join(' • ') || t('search.placeResultFallback', 'View place details'),
      link: `/place/${entity.slug}`,
      type: 'places',
      kind: entity.kind,
      keywords: [
        entity.name,
        entity.slug,
        entity.name_en,
        entity.address,
        entity.region,
        entity.region_en,
        entity.kind,
        ...(entity.aliases || []),
        ...(entity.categories || []),
        ...(entity.categoryIds || []),
      ].filter((keyword): keyword is string => Boolean(keyword)),
    })),
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
  ], [t, placeEntities]);

  const visibleSections = featureFlags.storeEnabled
    ? ['places', 'islands', 'product', 'store']
    : ['places', 'islands', 'product'];

  const getPlaceKindLabel = (kind?: EntityRecord['kind']): string | undefined => {
    switch (kind) {
      case 'restaurant':
        return t('search.placeKinds.restaurant', 'Restaurant');
      case 'municipality':
        return t('search.placeKinds.municipality', 'Area');
      case 'attraction':
        return t('search.placeKinds.attraction', 'Attraction');
      case 'poi':
        return t('search.placeKinds.poi', 'Place');
      default:
        return undefined;
    }
  };

  const getPlaceAccent = (kind?: EntityRecord['kind']) => {
    switch (kind) {
      case 'restaurant':
        return { bg: 'blue.50', border: 'blue.100', badge: 'blue.600', badgeBg: 'blue.100' };
      case 'municipality':
        return { bg: 'slate.50', border: 'slate.200', badge: 'slate.700', badgeBg: 'slate.100' };
      case 'attraction':
        return { bg: 'green.50', border: 'green.100', badge: 'green.700', badgeBg: 'green.100' };
      case 'poi':
        return { bg: 'amber.50', border: 'amber.100', badge: 'amber.700', badgeBg: 'amber.100' };
      default:
        return { bg: 'gray.50', border: 'gray.200', badge: 'gray.700', badgeBg: 'gray.100' };
    }
  };

  const getMapListTitle = (title: string) =>
    t('destination.itineraryMapTitle', {
      destination: title,
      defaultValue: '{{destination}} Points of Interest Map',
    });

  const handleShareMap = async (item: SearchResult) => {
    if (typeof window === 'undefined') return;

    const shareUrl = (() => {
      try {
        return new URL(item.link, window.location.origin).toString();
      } catch {
        return item.link;
      }
    })();

    const shareTitle = item.type === 'islands' ? getMapListTitle(item.title) : item.title;
    const shareText = item.type === 'places'
      ? t('search.sharePlaceText', 'Check this place:')
      : t('destinationSearch.shareText', 'Check this curated destination map:');

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: t('restaurantFinder.statusSuccess', 'Success'),
          description: item.type === 'places'
            ? t('search.copiedPlaceLink', 'Place link copied to clipboard.')
            : t('destinationSearch.copiedDestinationLink', 'Destination map link copied to clipboard.'),
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      toast({
        title: t('restaurantFinder.statusError', 'Unable to complete'),
        description: t('destinationSearch.shareFailed', 'Unable to share this destination right now.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
          aria-label={t('search.inputAriaNoStore', 'Search input for destinations, places, and map lists')}
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
                  const placeAccent = item.type === 'places' ? getPlaceAccent(item.kind) : undefined;
                  const openLabel = item.type === 'places'
                    ? t('search.openPlace', 'Open place')
                    : t('destinationSearch.openCuratedMapShort', 'Map');
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
                          {item.type === 'places' ? (
                            <Box
                              mb={2}
                              borderRadius="xl"
                              border="1px solid"
                              borderColor={placeAccent?.border}
                              bg={placeAccent?.bg}
                              overflow="hidden"
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                gap={3}
                                px={3}
                                py={3}
                                bgGradient="linear(to-br, white, transparent)"
                              >
                                <Box
                                  flexShrink={0}
                                  w={{ base: '52px', sm: '60px', md: '68px' }}
                                  h={{ base: '52px', sm: '60px', md: '68px' }}
                                  borderRadius="xl"
                                  border="1px solid"
                                  borderColor={placeAccent?.border}
                                  bg="white"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  boxShadow="sm"
                                >
                                  <Text
                                    fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                                    fontWeight="bold"
                                    letterSpacing="tight"
                                    color={placeAccent?.badge}
                                  >
                                    {getPlaceInitials(item.title)}
                                  </Text>
                                </Box>

                                <Box flex="1" minW={0}>
                                  <Text fontSize="xs" fontWeight="semibold" letterSpacing="wide" textTransform="uppercase" color="gray.500" mb={1}>
                                    {t('search.placeCardLabel', 'Place')}
                                  </Text>
                                  <Text fontSize={{ base: 'sm', sm: 'sm', md: 'md' }} fontWeight="semibold" color="gray.800" noOfLines={1} lineHeight="short">
                                    {item.title}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600" noOfLines={2} mt={0.5} lineHeight="short">
                                    {item.type === 'places' && item.kind ? `${getPlaceKindLabel(item.kind)} • ` : ''}
                                    {item.description}
                                  </Text>
                                </Box>

                              </Box>
                            </Box>
                          ) : item.type === 'islands' ? (
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
                          {item.type === 'places' && item.kind && (
                            <Text
                              display="inline-block"
                              mb={1.5}
                              px={2}
                              py={0.5}
                              fontSize="xs"
                              fontWeight="semibold"
                              color="gray.700"
                              bg="gray.100"
                              borderRadius="full"
                            >
                              {getPlaceKindLabel(item.kind)}
                            </Text>
                          )}
                          <Text
                            color="gray.600"
                            noOfLines={2}
                            lineHeight="1.45"
                            fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
                          >
                            {item.description}
                          </Text>
                      </Link>

                      <Box mt={2} display="grid" gridTemplateColumns={{ base: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }} gap={2}>
                        <Button
                          as={Link}
                          href={item.link}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          size="xs"
                          colorScheme={item.type === 'places' ? 'teal' : 'blue'}
                          variant="solid"
                          minH="44px"
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          fontWeight="semibold"
                          letterSpacing="tight"
                          whiteSpace="normal"
                          lineHeight="short"
                          textAlign="center"
                        >
                          {openLabel}
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="gray"
                          variant="outline"
                          minH="44px"
                          px={4}
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          fontWeight="semibold"
                          letterSpacing="tight"
                          whiteSpace="normal"
                          lineHeight="short"
                          textAlign="center"
                          onClick={() => {
                            void handleShareMap(item);
                          }}
                        >
                          {t('destinationSearch.shareMapShort', 'Share')}
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
