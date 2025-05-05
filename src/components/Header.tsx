'use client';

import React, { useState } from 'react';
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
  useColorModeValue,
  useDisclosure,
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMenuOpen, setMenuOpen] = useState(false); // State for the hamburger menu

  const bg = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.200', 'gray.700');
  const submenuHover = useColorModeValue('gray.300', 'gray.600');

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'el' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const handleNavigation = (href?: string) => {
    if (href) {
      router.push(href.startsWith('/') ? href : `/#${href}`);
      onClose();
    }
  };

  const toggleMenu = () => setMenuOpen(!isMenuOpen); // Toggle function for the menu

  return (
    <Box as="header" bg={bg} shadow="md" position="sticky" top="0" zIndex="50" w="full">
      {/* Top Bar */}
      <Box bg="gray.800" py="1" px={{ base: 4, md: 6 }}>
        <Flex justify="space-between" align="center" w="full" flexWrap="wrap" gap={4}>
          {/* Language Toggle */}
          <Button
            variant="ghost"
            onClick={toggleLanguage}
            color="whiteAlpha.600"
            _hover={{ bg: hoverBg, color: 'gray.400' }}
          >
            {i18n.language === 'en' ? 'Ελληνικά' : 'English'}
          </Button>

          {/* Promo Text */}
          <Box fontSize="md" color="white">
            {t('header.promo')}
          </Box>

          {/* Search Bar */}
          {/* Search Box Trigger (desktop only) */}
          <Box onClick={onOpen} cursor="pointer" ml="auto">
            <InputGroup maxW="400px" mt="2">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder={t('search.placeholder')}
                size="md"
                focusBorderColor="blue.500"
                isReadOnly
                pointerEvents="none"
              />
              </InputGroup>
            </Box>

          {/* Login Button */}
          <HStack spacing="6">
            {/* <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              color="white"
              _hover={{ bg: hoverBg }}
            >
              {t('header.login')}
            </Button> */}
          </HStack>
        </Flex>
      </Box>

      {/* Main Header */}
      <Box px={{ base: 4, md: 6 }} py="3">
        <Flex justify="space-between" align="center" wrap="wrap" w="full">
          {/* Logo and Company Name */}
          <HStack spacing="4">
            <Image
              src={logo}
              alt={t('company.logoAlt', { name: t('company.name') })}
              width={48}
              height={48}
              loading="lazy"
            />
            <Box fontSize="2xl" fontWeight="bold" color={textColor}>
              {t('company.name')}
            </Box>
          </HStack>

          {/* Desktop Navigation */}
          <HStack spacing="8" display={{ base: 'none', md: 'flex' }}>
            {navigation.map((item) =>
              !item.submenu ? (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => handleNavigation(item.href)}
                  _hover={{ textDecoration: 'underline', bg: hoverBg }}
                  color={textColor}
                >
                  {t(item.name)}
                </Button>
              ) : (
                <Menu key={item.name} isLazy>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    _hover={{ textDecoration: 'underline', bg: hoverBg }}
                    color={textColor}
                  >
                    {t(item.name)}
                  </MenuButton>
                  <MenuList bg={bg} borderColor="gray.300">
                    {item.submenu.map((subItem) => (
                      <MenuItem
                        key={subItem.name}
                        onClick={() => handleNavigation(subItem.href)}
                        _hover={{ bg: submenuHover }}
                      >
                        {t(subItem.name)}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              )
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={toggleMenu}
            variant="ghost"
            aria-label={isMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
            icon={isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            display={{ base: 'flex', md: 'none' }}
            _hover={{ bg: hoverBg }}
          />
        </Flex>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <Box
            bg={bg}
            shadow="lg"
            p="4"
            rounded="md"
            mt="4"
            overflowY="auto"
            maxH="80vh"
            display={{ base: 'block', md: 'none' }}
          >
            <VStack align="start" spacing="4" w="full">
              {navigation.map((item) => (
                <Box key={item.name} w="full">
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => {
                      handleNavigation(item.href);
                      setMenuOpen(false); // Close the menu after navigation
                    }}
                    _hover={{ bg: hoverBg }}
                    color={textColor}
                  >
                    {t(item.name)}
                  </Button>
                  {item.submenu && (
                    <VStack align="start" pl="4" spacing="2">
                      {item.submenu.map((subItem) => (
                        <Button
                          key={subItem.name}
                          variant="ghost"
                          w="full"
                          justifyContent="flex-start"
                          onClick={() => {
                            handleNavigation(subItem.href);
                            setMenuOpen(false); // Close the menu after navigation
                          }}
                          _hover={{ bg: submenuHover }}
                          fontSize="sm"
                          py="1"
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

      {/* Modal for SearchPage */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent w={{ base: '95%', md: '90%' }} maxW="unset">
          <ModalHeader>{t('header.search')}</ModalHeader>
          <ModalCloseButton />
            <ModalBody p={0}>
              <Box maxH="80vh" overflowY="auto" p={4}>
                <SearchPage />
              </Box>
            </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;
