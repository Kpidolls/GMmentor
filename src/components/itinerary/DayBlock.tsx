import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ItemBlock from './ItemBlock';
import { ItineraryDay, ItineraryItem } from './useItinerary';

type DayBlockProps = {
  day: ItineraryDay;
  dayIndex: number;
  totalDays: number;
  onUpdateDay: (updates: Partial<ItineraryDay>) => void;
  onDeleteDay: () => void;
  onOpenAddItem: () => void;
  onUpdateItem: (itemId: string, updates: Partial<ItineraryItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (itemId: string, targetDayIndex: number) => void;
};

const DayBlock = ({
  day,
  dayIndex,
  totalDays,
  onUpdateDay,
  onDeleteDay,
  onOpenAddItem,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
}: DayBlockProps) => {
  const { t } = useTranslation();

  return (
    <Box border="1px solid" borderColor="gray.300" bg="gray.50" borderRadius="lg" p={{ base: 3, md: 4 }}>
      <HStack justify="space-between" align="start" mb={3}>
        <Text fontWeight="bold">
          {t('itinerary.dayLabel', { index: dayIndex + 1, defaultValue: 'Day {{index}}' })}
        </Text>
        <Button colorScheme="red" variant="outline" size="sm" onClick={onDeleteDay}>
          {t('itinerary.deleteDay', 'Delete day')}
        </Button>
      </HStack>

      <HStack align="start" spacing={3} flexWrap="wrap">
        <FormControl>
          <FormLabel mb={1} fontSize="sm">
            {t('itinerary.dayTitle', 'Title')}
          </FormLabel>
          <Input
            value={day.title}
            onChange={(event) => onUpdateDay({ title: event.target.value })}
            placeholder={t('itinerary.dayTitlePlaceholder', 'Day title')}
          />
        </FormControl>
        <FormControl maxW={{ base: '100%', md: '220px' }}>
          <FormLabel mb={1} fontSize="sm">
            {t('itinerary.dayDate', 'Date')}
          </FormLabel>
          <Input
            type="date"
            value={day.date || ''}
            onChange={(event) => onUpdateDay({ date: event.target.value || null })}
          />
        </FormControl>
      </HStack>

      <FormControl mt={2}>
        <FormLabel mb={1} fontSize="sm">
          {t('itinerary.dayNotes', 'Day notes')}
        </FormLabel>
        <Textarea value={day.notes} onChange={(event) => onUpdateDay({ notes: event.target.value })} rows={3} />
      </FormControl>

      <HStack justify="space-between" mt={3} mb={2}>
        <Text fontWeight="semibold">{t('itinerary.items', 'Items')}</Text>
        <Button colorScheme="teal" size="sm" onClick={onOpenAddItem}>
          {t('itinerary.addItem', 'Add point')}
        </Button>
      </HStack>

      <VStack spacing={2} align="stretch">
        {day.items.length === 0 ? (
          <Text color="gray.600" fontSize="sm">
            {t('itinerary.noItemsForDay', 'No points for this day yet.')}
          </Text>
        ) : (
          day.items.map((item) => (
            <ItemBlock
              key={item.id}
              item={item}
              onChange={(updates) => onUpdateItem(item.id, updates)}
              onDelete={() => onDeleteItem(item.id)}
              currentDayIndex={dayIndex}
              totalDays={totalDays}
              onMoveToDay={(targetDayIndex) => onMoveItem(item.id, targetDayIndex)}
            />
          ))
        )}
      </VStack>
    </Box>
  );
};

export default DayBlock;
