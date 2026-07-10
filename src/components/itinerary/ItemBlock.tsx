import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ItineraryItem, ItineraryItemType } from './useItinerary';

type ItemBlockProps = {
  item: ItineraryItem;
  currentDayIndex: number;
  totalDays: number;
  onChange: (updates: Partial<ItineraryItem>) => void;
  onDelete: () => void;
  onMoveToDay: (targetDayIndex: number) => void;
};

const ItemBlock = ({ item, currentDayIndex, totalDays, onChange, onDelete, onMoveToDay }: ItemBlockProps) => {
  const { t } = useTranslation();
  const [targetDay, setTargetDay] = useState('');

  const handleMove = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    setTargetDay(next);
    if (!next) {
      return;
    }

    const targetDayIndex = Number(next);
    if (Number.isNaN(targetDayIndex) || targetDayIndex === currentDayIndex) {
      setTargetDay('');
      return;
    }

    onMoveToDay(targetDayIndex);
    setTargetDay('');
  };

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={3} bg="white">
      <HStack justify="space-between" align="start" mb={2}>
        <FormControl isRequired>
          <FormLabel mb={1} fontSize="sm" htmlFor={`itinerary-item-${item.id}-name`}>
            {t('itinerary.itemName', 'Point name')}
          </FormLabel>
          <Input
            id={`itinerary-item-${item.id}-name`}
            name={`item-${item.id}-name`}
            value={item.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </FormControl>
        <Button colorScheme="red" variant="outline" onClick={onDelete} size="sm" mt={6}>
          {t('itinerary.delete', 'Delete')}
        </Button>
      </HStack>

      <HStack align="start" spacing={3} flexWrap="wrap">
        <FormControl maxW={{ base: '100%', md: '170px' }}>
          <FormLabel mb={1} fontSize="sm" htmlFor={`itinerary-item-${item.id}-type`}>
            {t('itinerary.itemType', 'Type')}
          </FormLabel>
          <Select
            id={`itinerary-item-${item.id}-type`}
            name={`item-${item.id}-type`}
            value={item.type}
            onChange={(event) => onChange({ type: event.target.value as ItineraryItemType })}
          >
            <option value="place">{t('itinerary.typePlace', 'Place')}</option>
            <option value="area">{t('itinerary.typeArea', 'Area')}</option>
            <option value="guide">{t('itinerary.typeGuide', 'Guide')}</option>
            <option value="custom">{t('itinerary.typeCustom', 'Custom')}</option>
          </Select>
        </FormControl>

        <FormControl maxW={{ base: '100%', md: '140px' }}>
          <FormLabel mb={1} fontSize="sm" htmlFor={`itinerary-item-${item.id}-time`}>
            {t('itinerary.itemTime', 'Time')}
          </FormLabel>
          <Input
            id={`itinerary-item-${item.id}-time`}
            name={`item-${item.id}-time`}
            value={item.time || ''}
            onChange={(event) => onChange({ time: event.target.value })}
            placeholder="09:30"
          />
        </FormControl>

        <FormControl flex="1" minW={{ base: '100%', md: '220px' }}>
          <FormLabel mb={1} fontSize="sm" htmlFor={`itinerary-item-${item.id}-url`}>
            {t('itinerary.url', 'URL')}
          </FormLabel>
          <Input
            id={`itinerary-item-${item.id}-url`}
            name={`item-${item.id}-url`}
            value={item.url || ''}
            onChange={(event) => onChange({ url: event.target.value })}
            placeholder="https://..."
          />
        </FormControl>
      </HStack>

      <HStack align="start" spacing={3} mt={2} flexWrap="wrap">
        {totalDays > 1 ? (
          <FormControl maxW={{ base: '100%', md: '220px' }}>
            <FormLabel mb={1} fontSize="sm" htmlFor={`itinerary-item-${item.id}-move-to-day`}>
              {t('itinerary.moveToDay', 'Move to day')}
            </FormLabel>
            <Select
              id={`itinerary-item-${item.id}-move-to-day`}
              name={`item-${item.id}-move-to-day`}
              value={targetDay}
              onChange={handleMove}
            >
              <option value="">{t('itinerary.chooseDay', 'Choose day')}</option>
              {Array.from({ length: totalDays }).map((_, index) => (
                <option key={`move-day-${index}`} value={index} disabled={index === currentDayIndex}>
                  {t('itinerary.dayLabel', { index: index + 1, defaultValue: `Day ${index + 1}` })}
                </option>
              ))}
            </Select>
          </FormControl>
        ) : null}

        <FormControl maxW={{ base: '100%', md: '240px' }}>
          <FormLabel mb={1} fontSize="sm" htmlFor={`itinerary-item-${item.id}-gm-id`}>
            {t('itinerary.gmId', 'Google Maps ID')}
          </FormLabel>
          <Input
            id={`itinerary-item-${item.id}-gm-id`}
            name={`item-${item.id}-gm-id`}
            value={item.gmId || ''}
            onChange={(event) => onChange({ gmId: event.target.value })}
          />
        </FormControl>

        <FormControl flex="1" minW={{ base: '100%', md: '220px' }}>
          <FormLabel mb={1} fontSize="sm" htmlFor={`itinerary-item-${item.id}-notes`}>
            {t('itinerary.notes', 'Notes')}
          </FormLabel>
          <Textarea
            id={`itinerary-item-${item.id}-notes`}
            name={`item-${item.id}-notes`}
            value={item.notes || ''}
            onChange={(event) => onChange({ notes: event.target.value })}
            rows={2}
          />
        </FormControl>
      </HStack>
    </Box>
  );
};

export default ItemBlock;
