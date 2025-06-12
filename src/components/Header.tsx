'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Text,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import config from '../config/index.json';
import SearchPage from './SearchPage';

const Header = () => {
  const { company, navigation } = config;
  const { logo } = company;

  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false });
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    setIsLanguageReady(true); // Ensure language is ready before rendering
  }, []);

  if (!isLanguageReady) return null; // Avoid rendering until language is ready

  const bg = 'white'; // Default background color
  const textColor = 'gray.800'; // Default text color
  const hoverBg = 'gray.100'; // Default hover background color
  const submenuHover = 'gray.200'; // Default submenu hover background color

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'el' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang); // ✅ persist language
  };

  const handleNavigation = (href?: string) => {
    if (href) {
      router.push(href.startsWith('/') ? href : `/#${href}`);
      onClose();
      setMenuOpen(false);
    }
  };

  return (
    <Box as="header" bg={bg} shadow="sm" position="sticky" top="0" zIndex="50" w="full">
      {/* Top Bar */}
      <Flex
        bg="gray.800"
        color="white"
        px={{ base: 4, md: 8 }}
        py={2}
        align="center"
        justify="space-between"
        flexWrap="wrap"
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleLanguage}
          color="whiteAlpha.800"
          _hover={{ bg: hoverBg, color: 'gray.400' }}
        >
          {i18n.language === 'en' ? 'Ελληνικά' : 'English'}
        </Button>

        <Text fontSize="sm" textAlign="center" flex="1">
          {t('header.promo')}
        </Text>

        <Box onClick={onOpen} cursor="pointer">
          <InputGroup maxW="250px" size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              isReadOnly
              placeholder={t('search.placeholder')}
              pointerEvents="none"
              focusBorderColor="blue.400"
              _placeholder={{ color: 'gray.400' }}
            />
          </InputGroup>
        </Box>
      </Flex>

      {/* Main Header */}
      <Box px={{ base: 4, md: 8 }} py={4}>
        <Flex align="center" justify="space-between" wrap="wrap">
          {/* Logo and Company */}
          <HStack spacing={3} onClick={() => router.push('/')} cursor="pointer">
            <Image
              src={logo}
              alt={t('company.logoAlt', { name: t('company.name') })}
              width={40}
              height={40}
              loading="lazy"
            />
            <Text
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              fontWeight="bold"
              color={textColor}
              textShadow="0 2px 8px rgba(0,0,0,0.12)"
              letterSpacing="tight"
              className="leading-tight tracking-tight"
            >
              {t('company.name')}
            </Text>
          </HStack>

          {/* Desktop Nav */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            {navigation.map((item) =>
              !item.submenu ? (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => handleNavigation(item.href)}
                  _hover={{ bg: hoverBg }}
                  color={textColor}
                >
                  {t(item.name)}
                </Button>
              ) : (
                <Menu key={item.name} isLazy>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    _hover={{ bg: hoverBg }}
                    color={textColor}
                  >
                    {t(item.name)}
                  </MenuButton>
                  <MenuList
                    bg={bg}
                    borderColor="gray.300"
                    shadow="lg"
                    py={2}
                    borderRadius="md"
                  >
                    {item.submenu.map((subItem) => (
                      <MenuItem
                        key={subItem.name}
                        onClick={() => handleNavigation(subItem.href)}
                        _hover={{ bg: submenuHover, color: 'blue.500' }}
                        fontSize="sm"
                        fontWeight="medium"
                        px={4}
                        py={2}
                      >
                        {t(subItem.name)}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              )
            )}
          </HStack>

          {/* Mobile Menu Toggle */}
          <IconButton
            onClick={() => setMenuOpen(!isMenuOpen)}
            icon={isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="ghost"
            aria-label={isMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
            display={{ base: 'flex', md: 'none' }}
            _hover={{ bg: hoverBg }}
          />
        </Flex>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <Box mt={4} display={{ base: 'block', md: 'none' }}>
            <VStack spacing={2} align="stretch">
              {navigation.map((item) => (
                <Box key={item.name}>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => handleNavigation(item.href)}
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    {t(item.name)}
                  </Button>
                  {item.submenu && (
                    <VStack align="start" pl={4} spacing={1}>
                      {item.submenu.map((subItem) => (
                        <Button
                          key={subItem.name}
                          variant="ghost"
                          w="full"
                          fontSize="sm"
                          justifyContent="flex-start"
                          onClick={() => handleNavigation(subItem.href)}
                          _hover={{ bg: submenuHover }}
                          color={textColor}
                        >
                          {t(subItem.name)}
                        </Button>
                      ))}
                    </VStack>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Box>

      {/* Search Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent maxW="95vw">
          <ModalHeader>{t('header.search')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <Box maxH="75vh" overflowY="auto" p={4}>
              <SearchPage focusOnMount={isOpen} />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;
