import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import tickerItems from '../data/tickerItems.json';

function MyTicker() {
  const { t } = useTranslation();

  return (
    <Box
      className="ticker-container"
      position="relative"
      zIndex="20"
      width="100%"
      overflow="hidden"
      color="black"
      py="2"
      sx={{
        '&:hover .animate-scroll': {
          animationPlayState: 'paused',
        },
      }}
    >
      <Flex
        className="animate-scroll"
        whiteSpace="nowrap"
        minWidth="max-content"
        gap="5"
        animation="scroll 60s linear infinite"
      >
        {tickerItems.map((item, index) => {
          const [highlight, ...rest] = t(`ticker.${item.key}`).split(':');
          return (
            <Text
              key={index}
              display="inline-block"
              fontSize="sm"
              fontWeight="medium"
              px="2"
            >
              <Text as="span" color="#0878fe" fontWeight="bold">
                {highlight}:
              </Text>{' '}
              <Text as="span">{rest.join(':')}</Text>
            </Text>
          );
        })}
      </Flex>
    </Box>
  );
}

export default MyTicker;