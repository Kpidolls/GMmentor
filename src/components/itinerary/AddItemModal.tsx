import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ItineraryItemType } from './useItinerary';

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    type: ItineraryItemType;
    gmId?: string;
    url?: string;
    time?: string;
    notes?: string;
  }) => void;
};

const AddItemModal = ({ isOpen, onClose, onAdd }: AddItemModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<ItineraryItemType>('custom');
  const [gmId, setGmId] = useState('');
  const [url, setUrl] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setType('custom');
      setGmId('');
      setUrl('');
      setTime('');
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    onAdd({
      name: trimmedName,
      type,
      gmId: gmId.trim() || undefined,
      url: url.trim() || undefined,
      time: time.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('itinerary.addItem', 'Add point')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="grid" gap={3}>
          <FormControl isRequired>
            <FormLabel>{t('itinerary.name', 'Name')}</FormLabel>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('itinerary.itemNamePlaceholder', 'e.g. Acropolis')}
            />
          </FormControl>

          <FormControl>
            <FormLabel>{t('itinerary.itemType', 'Type')}</FormLabel>
            <Select value={type} onChange={(event) => setType(event.target.value as ItineraryItemType)}>
              <option value="place">place</option>
              <option value="area">area</option>
              <option value="guide">guide</option>
              <option value="custom">custom</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>{t('itinerary.itemTime', 'Time')}</FormLabel>
            <Input value={time} onChange={(event) => setTime(event.target.value)} placeholder="09:30" />
          </FormControl>

          <FormControl>
            <FormLabel>URL</FormLabel>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." />
          </FormControl>

          <FormControl>
            <FormLabel>GM ID</FormLabel>
            <Input value={gmId} onChange={(event) => setGmId(event.target.value)} placeholder="gm_..." />
          </FormControl>

          <FormControl>
            <FormLabel>{t('itinerary.notes', 'Notes')}</FormLabel>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </FormControl>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            {t('itinerary.cancel', 'Cancel')}
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit}>
            {t('itinerary.addItem', 'Add point')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddItemModal;
