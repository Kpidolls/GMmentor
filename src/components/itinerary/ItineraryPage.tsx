import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Input,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import AddItemModal from './AddItemModal';
import DayBlock from './DayBlock';
import { exportJson, exportReadableTxt } from './exportUtils';
import { importJson } from './importUtils';
import { useItinerary } from './useItinerary';

const encodeBase64 = (text: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.btoa(unescape(encodeURIComponent(text)));
};

const decodeBase64 = (text: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return decodeURIComponent(escape(window.atob(text)));
};

const downloadContent = (filename: string, content: string, mimeType: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const ItineraryPage = () => {
  const { t, i18n } = useTranslation();
  const {
    itinerary,
    addDay,
    updateDay,
    deleteDay,
    addItem,
    updateItem,
    deleteItem,
    moveItemToDay,
    resetItinerary,
    replaceItinerary,
  } = useItinerary();

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [importError, setImportError] = useState('');
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const hydratedFromUrl = useRef(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (typeof window === 'undefined' || hydratedFromUrl.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (!data) {
      hydratedFromUrl.current = true;
      return;
    }

    try {
      const decoded = decodeBase64(data);
      const imported = importJson(decoded);
      replaceItinerary(imported);
      toast({
        title: t('itinerary.toast.loadedFromLink', 'Itinerary loaded from shared link.'),
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch {
      setImportError(t('itinerary.importError', 'The file is not valid.'));
    }

    hydratedFromUrl.current = true;
  }, [replaceItinerary, t, toast]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    const encoded = encodeBase64(exportJson(itinerary));
    return `${window.location.origin}/itinerary?data=${encodeURIComponent(encoded)}`;
  }, [itinerary]);

  const handleOpenAddItem = (dayIndex: number) => {
    setActiveDayIndex(dayIndex);
    onOpen();
  };

  const handleAddItemFromModal = (item: {
    name: string;
    type: 'place' | 'area' | 'guide' | 'custom';
    gmId?: string;
    url?: string;
    time?: string;
    notes?: string;
  }) => {
    if (activeDayIndex === null) {
      return;
    }

    addItem(activeDayIndex, item);
  };

  const handleExportTxt = () => {
    downloadContent('my-greece-itinerary.txt', exportReadableTxt(itinerary, i18n.language), 'text/plain;charset=utf-8');
  };

  const handleExportJson = () => {
    downloadContent('my-greece-itinerary.json', exportJson(itinerary), 'application/json;charset=utf-8');
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileContent = await file.text();
      const imported = importJson(fileContent);
      replaceItinerary(imported);
      setImportError('');
      toast({
        title: t('itinerary.toast.loadedFile', 'File loaded.'),
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch {
      setImportError(t('itinerary.importError', 'The file is not valid.'));
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    resetItinerary();
    setImportError('');
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl || typeof window === 'undefined') {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }

      toast({
        title: t('itinerary.toast.linkCopied', 'Share link copied.'),
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch {
      toast({
        title: t('itinerary.toast.copyFailed', 'Copy failed.'),
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="4xl" py={{ base: 4, md: 8 }} px={{ base: 3, md: 4 }}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading as="h1" size="xl" mb={1}>
            {t('itinerary.title', 'My Greece Itinerary')}
          </Heading>
          <Text color="gray.600">{t('itinerary.subtitle', 'Personal trip plan stored only on your device.')}</Text>
        </Box>

        <HStack spacing={2} flexWrap="wrap">
          <Button colorScheme="teal" onClick={addDay}>
            {t('itinerary.addDay', 'Add day')}
          </Button>
          <Button onClick={handleExportTxt}>{t('itinerary.saveTxt', 'Save file (TXT)')}</Button>
          <Button onClick={handleExportJson}>{t('itinerary.saveJson', 'Save file (JSON)')}</Button>
          <Button onClick={handleImportClick}>{t('itinerary.loadFile', 'Load file')}</Button>
          <Button colorScheme="red" variant="outline" onClick={handleReset}>
            {t('itinerary.clear', 'Reset')}
          </Button>
          <Button colorScheme="blue" variant="outline" onClick={handleCopyShareUrl}>
            {t('itinerary.share', 'Share')}
          </Button>
        </HStack>

        <Input ref={importInputRef} type="file" accept="application/json,.json" display="none" onChange={handleImportFile} />

        {importError ? (
          <Text color="red.600" fontWeight="semibold">
            {importError}
          </Text>
        ) : null}

        {itinerary.days.length === 0 ? (
          <Box p={5} border="1px dashed" borderColor="gray.300" borderRadius="md" bg="white">
            <Text color="gray.700">{t('itinerary.emptyState', 'Start your trip. Add your first day.')}</Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={3}>
            {itinerary.days.map((day, dayIndex) => (
              <DayBlock
                key={`day-${dayIndex}`}
                day={day}
                dayIndex={dayIndex}
                onUpdateDay={(updates) => updateDay(dayIndex, updates)}
                onDeleteDay={() => deleteDay(dayIndex)}
                onOpenAddItem={() => handleOpenAddItem(dayIndex)}
                onUpdateItem={(itemId, updates) => updateItem(dayIndex, itemId, updates)}
                onDeleteItem={(itemId) => deleteItem(dayIndex, itemId)}
                onMoveItem={(itemId, targetDayIndex) => moveItemToDay(dayIndex, itemId, targetDayIndex)}
                totalDays={itinerary.days.length}
              />
            ))}
          </VStack>
        )}
      </VStack>

      <AddItemModal isOpen={isOpen} onClose={onClose} onAdd={handleAddItemFromModal} />
    </Container>
  );
};

export default ItineraryPage;
