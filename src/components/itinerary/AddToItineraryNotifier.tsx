import { useEffect, useRef } from 'react';
import { Box, HStack, Text, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

type AddToItineraryEventDetail = {
  name?: string;
};

const AddToItineraryNotifier = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const pendingNamesRef = useRef<string[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const flushNotifications = () => {
      const names = Array.from(new Set(pendingNamesRef.current.filter(Boolean)));
      pendingNamesRef.current = [];
      if (names.length === 0) {
        return;
      }

      const isBatch = names.length > 1;
      const title = isBatch
        ? t('itinerary.toast.addedMultipleToDayOne', {
            count: names.length,
            defaultValue: '{{count}} locations added to Day 1',
          })
        : t('itinerary.toast.addedToDayOne', 'Added to Day 1');

      const description = isBatch
        ? t('itinerary.toast.addedMultipleLocations', {
            count: names.length,
            defaultValue: '{{count}} selected locations were added to your itinerary.',
          })
        : t('itinerary.toast.addedLocation', {
            name: names[0],
            defaultValue: '{{name}} added to your itinerary.',
          });

      toast({
        duration: isBatch ? 3600 : 2600,
        isClosable: true,
        position: 'top',
        render: () => (
          <Box
            maxW="sm"
            w="full"
            bg="white"
            border="1px solid"
            borderColor="teal.200"
            borderRadius="xl"
            boxShadow="0 14px 32px rgba(15, 23, 42, 0.18)"
            px={4}
            py={3}
          >
            <HStack align="start" spacing={3}>
              <Box mt={1} w={2.5} h={2.5} borderRadius="full" bg="teal.500" />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.900">
                  {title}
                </Text>
                <Text fontSize="sm" color="gray.700" mt={0.5}>
                  {description}
                </Text>
              </Box>
            </HStack>
          </Box>
        ),
      });
    };

    const onAddToItinerary = (event: Event) => {
      const customEvent = event as CustomEvent<AddToItineraryEventDetail>;
      const detail = customEvent.detail || {};
      const name = (detail.name || '').trim();
      if (!name) {
        return;
      }

      pendingNamesRef.current.push(name);
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
      flushTimerRef.current = setTimeout(flushNotifications, 180);
    };

    window.addEventListener('gm:addToItinerary', onAddToItinerary as EventListener);
    return () => {
      window.removeEventListener('gm:addToItinerary', onAddToItinerary as EventListener);
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, [t, toast]);

  return null;
};

export default AddToItineraryNotifier;
