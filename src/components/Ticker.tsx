import React from 'react';
import { Box, Flex, Text, usePrefersReducedMotion } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import tickerItems from '../data/tickerItems.json';
import islandsData from '../data/islands.json';

type TickerDestinationItem = {
  destinationId: string;
  id: string;
  slug: string;
};

type DestinationEntry = {
  id: string;
  title: string;
  img: string;
  locationImg?: string;
  link: string;
  target?: string;
  rel?: string;
};

const DESTINATION_TICKER_LIMIT = 18;
const TICKER_SCROLL_DURATION_SECONDS = 90;

function MyTicker() {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const destinationsById = new Map(
    (islandsData as DestinationEntry[]).map((destination) => [String(destination.id).trim(), destination])
  );
  const tickerDestinations = (tickerItems as TickerDestinationItem[])
    .map((item) => destinationsById.get(String(item.destinationId).trim()))
    .filter((destination): destination is DestinationEntry => Boolean(destination))
    .slice(0, DESTINATION_TICKER_LIMIT);
  const renderedDestinations = prefersReducedMotion
    ? tickerDestinations
    : [...tickerDestinations, ...tickerDestinations];
  const destinationLead = t(
    'ticker.destinationLead',
    'Tap a destination to open its map.'
  );
  const getDestinationHref = (destinationId: string) => `/destination/${encodeURIComponent(String(destinationId).trim())}`;

  return (
    <Box
      as="nav"
      className="ticker-container"
      aria-label={t('ticker.destinationNavAria', 'Destination ticker')}
      position="relative"
      zIndex="20"
      width="100%"
      color="black"
      py={{ base: 1.5, sm: 2 }}
      style={{ '--ticker-duration': `${TICKER_SCROLL_DURATION_SECONDS}s` } as React.CSSProperties}
    >
      <Flex className="ticker-row" whiteSpace="nowrap">
        <Text
          as="span"
          display={{ base: 'none', sm: 'inline-flex' }}
          alignItems="center"
          fontSize="sm"
          fontWeight="semibold"
          px="3"
          py="1"
          borderRadius="full"
          bg="whiteAlpha.900"
          border="1px solid"
          borderColor="gray.300"
          color="gray.700"
          flexShrink={0}
          whiteSpace="nowrap"
        >
          {destinationLead}
        </Text>

        <Box className="ticker-track-viewport">
          <Box
            as="ul"
            className={prefersReducedMotion ? 'ticker-track ticker-track--static' : 'ticker-track animate-scroll-track'}
            whiteSpace="nowrap"
            gap="4"
            m="0"
            p="0"
            listStyleType="none"
          >
            {renderedDestinations.map((destination, index) => {
              const destinationLabel = t(destination.title, destination.id);
              return (
                <Box
                  as="li"
                  key={`${destination.id}-${index}`}
                  display="inline-flex"
                  alignItems="center"
                >
                  <Link
                    href={getDestinationHref(destination.id)}
                    className="ticker-pill-link"
                    title={t('ticker.destinationTitle', 'GoogleMentor curated points of interest for {{destination}}', {
                      destination: destinationLabel,
                    })}
                    aria-label={t('ticker.destinationAriaLabel', 'Open destination page for {{destination}}', {
                      destination: destinationLabel,
                    })}
                  >
                    <Box display="inline-flex" alignItems="center" mr="2" position="relative" minW={{ base: '24px', md: '26px' }} h={{ base: '24px', md: '26px' }}>
                      <Box
                        as="img"
                        src={destination.img}
                        alt={destinationLabel}
                        width={{ base: '22px', md: '24px' }}
                        height={{ base: '22px', md: '24px' }}
                        minWidth={{ base: '22px', md: '24px' }}
                        borderRadius="full"
                        objectFit="cover"
                        border="1px solid"
                        borderColor="blue.300"
                        bg="white"
                        loading="lazy"
                        decoding="async"
                      />
                      <Box
                        as="img"
                        src={destination.locationImg || destination.img}
                        alt={t('islands.locationScreenshotAlt', {
                          title: destinationLabel,
                          defaultValue: '{{title}} locations screenshot',
                        })}
                        width={{ base: '12px', md: '13px' }}
                        height={{ base: '12px', md: '13px' }}
                        minWidth={{ base: '12px', md: '13px' }}
                        borderRadius="sm"
                        objectFit="contain"
                        border="1px solid"
                        borderColor="white"
                        position="absolute"
                        right="-1px"
                        bottom="-1px"
                        zIndex={3}
                        boxShadow="0 0 0 1px rgba(148, 163, 184, 0.85)"
                        bg="white"
                        loading="lazy"
                        decoding="async"
                      />
                    </Box>
                    <Text
                      as="span"
                      color="blue.800"
                      fontWeight="bold"
                      letterSpacing="tight"
                      lineHeight="short"
                      fontSize={{ base: 'xs', md: 'sm' }}
                      mr="1"
                    >
                      {destinationLabel}
                    </Text>
                  </Link>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

export default MyTicker;