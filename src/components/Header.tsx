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
  Icon,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import config from '../config/index.json';
import SearchPage from './SearchPage';
import { usePWA } from '../hooks/usePWA';

const Header = () => {
  const logDevWarning = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  };

  const { company, navigation } = config;
  const { logo } = company;

  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false });
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLanguageReady, setIsLanguageReady] = useState(false);
  
  // PWA Hook for install functionality
  const { isInstallable, isInstalled, isStandalone, isMobile, isIOS, isOnline, installApp } = usePWA();

  useEffect(() => {
    setIsLanguageReady(true); // Ensure language is ready before rendering
  }, []);

  if (!isLanguageReady) return null; // Avoid rendering until language is ready

  const bg = 'white'; // Default background color
  const textColor = 'gray.800'; // Default text color
  const hoverBg = 'gray.100'; // Default hover background color
  const navButtonStyles = {
    bg: 'white',
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: 'full',
    fontWeight: 'semibold',
    letterSpacing: '0.02em',
    px: 4,
    h: 10,
    boxShadow: 'sm',
    transition: 'all 0.2s',
    _hover: {
      bg: 'gray.50',
      borderColor: 'gray.300',
      transform: 'translateY(-1px)',
      boxShadow: 'md'
    },
    _active: {
      bg: 'gray.100',
      transform: 'translateY(0)'
    },
    _focusVisible: {
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.3)'
    }
  };
  const mobileNavButtonStyles = {
    ...navButtonStyles,
    w: 'full',
    justifyContent: 'flex-start',
    h: 12,
    px: 4,
    fontSize: 'sm',
    fontWeight: 'bold',
    borderRadius: 'xl',
    bg: 'white',
    border: '1px solid',
    borderColor: 'blue.100',
    boxShadow: 'sm',
    _hover: {
      bg: 'blue.50',
      borderColor: 'blue.200',
      transform: 'translateY(-1px)',
      boxShadow: 'md'
    },
    _active: {
      bg: 'blue.100',
      transform: 'translateY(0)'
    },
    _focusVisible: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)'
    }
  };

  const renderNavIcon = (name: string) => {
    switch (name) {
      case 'navigation.maps':
        return (
          <Icon viewBox="0 0 24 24" boxSize={{ base: 4.5, md: 3.5 }} color="blue.500">
            <path
              d="M9 20l-5-2.5V4l5 2.5 6-3 5 2.5V20l-5-2.5-6 3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.store':
        return (
          <Icon viewBox="0 0 24 24" boxSize={{ base: 4.5, md: 3.5 }} color="blue.500">
            <path
              d="M6 9h12l-1 11H7L6 9Zm2-4h8l1 4H7l1-4Zm-3 4h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.aboutUs':
        return (
          <Icon viewBox="0 0 24 24" boxSize={{ base: 4.5, md: 3.5 }} color="blue.500">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      default:
        return null;
    }
  };

  const renderSubNavIcon = (name: string) => {
    switch (name) {
      case 'navigation.mustSee':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16l-4.8 2.9.9-5.4-3.9-3.8 5.4-.8L12 4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.islands':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M5 18c3-1 4-6 7-9 3-3 6-3 7-2-1 3-3 8-6 10s-5 2-8 1Zm0 0c2 1 4 2 7 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.activities':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M5 19l5-5 3 3 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="17" cy="8" r="2" fill="currentColor" />
          </Icon>
        );
      case 'navigation.travelItems':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M7 7h10v12H7V7Zm2-3h6v3H9V4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.mobileTravelData':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <rect x="7" y="3" width="10" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </Icon>
        );
      case 'navigation.travelInsurance':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M12 4l7 3v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.ourStory':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M6 4h9l3 3v13H6V4Zm9 0v3h3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.faq':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.blog':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M6 5h8l4 4v10H6V5Zm8 0v4h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.contact':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M4 6h16v12H4V6Zm0 0 8 6 8-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      default:
        return null;
    }
  };

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
        px={{ base: 2, md: 8 }}
        py={2}
        align="center"
        justify="space-between"
        flexWrap="nowrap"
        gap={{ base: 1, md: 3 }}
        minH="44px"
      >
        <HStack spacing={{ base: 1, md: 3 }} flex="1" minW="0">
          <Button
            size={{ base: "xs", md: "sm" }}
            variant="ghost"
            onClick={toggleLanguage}
            color="whiteAlpha.800"
            _hover={{ bg: hoverBg, color: 'gray.400' }}
            fontSize={{ base: "xs", md: "sm" }}
            px={{ base: 2, md: 4 }}
            minW="0"
            flexShrink={0}
          >
            {i18n.language === 'en' ? 'ΕΛ' : 'EN'}
          </Button>
          
          {/* PWA Install Button */}
          {((isInstallable && !isInstalled && !isStandalone) || 
            (isMobile && isIOS && !isInstalled && !isStandalone) || 
            process.env.NODE_ENV === 'development') && isOnline && (
            <Button
              size={{ base: "xs", md: "sm" }}
              bgGradient="linear(to-r, teal.500, green.500)"
              color="white"
              _hover={{ 
                bgGradient: "linear(to-r, teal.400, green.400)",
                transform: "scale(1.05)"
              }}
              _active={{ transform: "scale(0.95)" }}
              onClick={async () => {
                try {
                  if (isIOS && isMobile) {
                    // For iOS, show manual install instructions
                    alert(`📱 ${t('ios.installInstructions', 'To install this app on your iOS device:\n\n1. Tap the Share button (📤) at the bottom of Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm\n\nThe app will then appear on your home screen!')}`);
                  } else {
                    const installed = await installApp();
                    if (!installed && process.env.NODE_ENV === 'development') {
                      alert(t('pwa.devInstallPromptShort', 'PWA Install Button Test: In production, this would trigger the install prompt.'));
                    }
                  }
                } catch (error) {
                  logDevWarning('Failed to install app:', error);
                }
              }}
              leftIcon={
                <Box display="inline-flex" w={{ base: "10px", md: "14px" }} h={{ base: "10px", md: "14px" }}>
                  <svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Box>
              }
              borderRadius="full"
              fontSize={{ base: "2xs", md: "xs" }}
              fontWeight="bold"
              px={{ base: 1.5, md: 4 }}
              py={{ base: 1, md: 2 }}
              h={{ base: "20px", md: "auto" }}
              position="relative"
              overflow="hidden"
              transition="all 0.2s"
              boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)"
              minW="0"
              flexShrink={0}
            >
              <Box display={{ base: "none", sm: "block" }}>
                {t('pwa.getApp', 'Get App')}
              </Box>
              <Box display={{ base: "block", sm: "none" }}>
                App
              </Box>
            </Button>
          )}
        </HStack>

        <Text fontSize="sm" textAlign="center" flex="1" display={{ base: 'none', lg: 'block' }}>
          {t('header.promo')}
        </Text>

        <Box onClick={onOpen} cursor="pointer" flex="1" maxW={{ base: "100px", sm: "140px", md: "250px" }} minW="0">
          <InputGroup size={{ base: "xs", md: "sm" }} w="full">
            <InputLeftElement pointerEvents="none" h={{ base: "20px", md: "32px" }} w={{ base: "20px", md: "32px" }}>
              <SearchIcon color="gray.400" boxSize={{ base: "10px", md: "16px" }} />
            </InputLeftElement>
            <Input
              isReadOnly
              placeholder={t('search.placeholder', 'Search...')}
              pointerEvents="none"
              focusBorderColor="blue.400"
              _placeholder={{ color: 'gray.400' }}
              id="header-search"
              fontSize={{ base: "10px", md: "sm" }}
              h={{ base: "20px", md: "32px" }}
              pl={{ base: "20px", md: "32px" }}
              borderRadius={{ base: "sm", md: "md" }}
            />
          </InputGroup>
        </Box>
      </Flex>

      {/* Main Header */}
      <Box px={{ base: 4, md: 8 }} py={4}>
        <Flex align="center" justify="space-between" wrap="wrap">
          {/* Logo and Company */}
          <HStack spacing={3} onClick={() => window.location.href = '/'} cursor="pointer">
            <Image
              src={logo}
              alt={t('company.logoAlt', { name: t('company.name') })}
              width={40}
              height={40}
              priority 
              unoptimized={false} 
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
                  leftIcon={renderNavIcon(item.name) || undefined}
                  {...navButtonStyles}
                  color={textColor}
                >
                  {t(item.name)}
                </Button>
              ) : (
                <Menu key={item.name} isLazy>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    rightIcon={<ChevronDownIcon />}
                    leftIcon={renderNavIcon(item.name) || undefined}
                    {...navButtonStyles}
                    color={textColor}
                  >
                    {t(item.name)}
                  </MenuButton>
                  <MenuList
                    bg="white"
                    borderColor="gray.200"
                    shadow="2xl"
                    py={2}
                    px={2}
                    borderRadius="xl"
                    minW="220px"
                  >
                    {item.submenu.map((subItem) => (
                      <MenuItem
                        key={subItem.name}
                        onClick={() => handleNavigation(subItem.href)}
                        _hover={{ bg: 'blue.50', color: 'blue.700' }}
                        _focus={{ bg: 'blue.50', color: 'blue.700' }}
                        fontSize="sm"
                        fontWeight="semibold"
                        px={3}
                        py={2.5}
                        borderRadius="md"
                      >
                        {renderSubNavIcon(subItem.name) ? (
                          <HStack spacing={2}>
                            {renderSubNavIcon(subItem.name)}
                            <Text>{t(subItem.name)}</Text>
                          </HStack>
                        ) : (
                          <Text>{t(subItem.name)}</Text>
                        )}
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
            borderRadius="full"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            boxShadow="sm"
            _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
            _active={{ bg: 'gray.100' }}
          />
        </Flex>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <Box
            mt={3}
            display={{ base: 'block', md: 'none' }}
            maxH="80vh"
            overflowY="auto"
            pr={1}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="2xl"
            boxShadow="xl"
            p={3}
            animation="fadeIn 0.2s ease"
          >
            <Flex align="center" justify="space-between" px={2} py={1} mb={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="0.08em" textTransform="uppercase">
                {t('navigation.maps', 'Lists')}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setMenuOpen(false)}
                borderRadius="full"
                color="gray.600"
                _hover={{ bg: 'gray.100' }}
              >
                {t('aria.closeMenu', 'Close Menu')}
              </Button>
            </Flex>
            <VStack spacing={2} align="stretch">
              {navigation.map((item) => (
                <Box key={item.name}>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation(item.href)}
                    color="gray.800"
                    leftIcon={renderNavIcon(item.name) || undefined}
                    {...mobileNavButtonStyles}
                  >
                    {t(item.name)}
                  </Button>
                  {item.submenu && (
                    <VStack align="start" pl={3} pr={1} py={2} spacing={1.5} bg="gray.50" borderRadius="lg" mt={1} border="1px solid" borderColor="gray.100">
                      {item.submenu.map((subItem) => (
                        <Button
                          key={subItem.name}
                          variant="ghost"
                          w="full"
                          fontSize="sm"
                          justifyContent="flex-start"
                          onClick={() => handleNavigation(subItem.href)}
                          leftIcon={renderSubNavIcon(subItem.name) || undefined}
                          _hover={{ bg: 'blue.50' }}
                          color={textColor}
                          borderRadius="lg"
                          px={3}
                          h={10}
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
