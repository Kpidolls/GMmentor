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
  useDisclosure,
  Text,
  Icon,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import config from '../config/index.json';
import featureFlags from '../config/featureFlags.json';
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
  const visibleNavigation = featureFlags.storeEnabled
    ? navigation
    : navigation.filter((item) => item.name !== 'navigation.store' && item.href !== '/store');

  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false });
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const [isLanguageReady, setIsLanguageReady] = useState(false);
  
  // PWA Hook for install functionality
  const { isInstallable, isInstalled, isStandalone, isMobile, isIOS, isOnline, installApp } = usePWA();

  useEffect(() => {
    setIsLanguageReady(true); // Ensure language is ready before rendering
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      onClose();
      setMenuOpen(false);
      setOpenMobileSection(null);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [onClose, router.events]);

  if (!isLanguageReady) return null; // Avoid rendering until language is ready

  const bg = 'white'; // Default background color
  const textColor = 'gray.800'; // Default text color
  const navButtonStyles = {
    bg: 'white',
    border: '1px solid',
    borderColor: 'gray.300',
    borderRadius: 'lg',
    fontWeight: 'semibold',
    letterSpacing: '0.01em',
    fontSize: { lg: 'xs', xl: 'sm' },
    px: { lg: 2.5, xl: 3.5 },
    h: { lg: 9, xl: 10 },
    boxShadow: 'var(--gm-shadow-1)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
    _hover: {
      bg: 'white',
      borderColor: 'gray.300',
      color: 'gray.900',
      boxShadow: 'var(--gm-shadow-2)'
    },
    _active: {
      bg: 'gray.100',
      borderColor: 'gray.300',
      color: 'gray.900'
    },
    _focusVisible: {
      boxShadow: 'var(--gm-focus-ring)'
    },
    sx: {
      '.chakra-button__icon:first-of-type': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        w: { lg: '20px', xl: '22px' },
        h: { lg: '20px', xl: '22px' },
        borderRadius: 'md',
        bg: 'gray.100',
        border: '1px solid',
        borderColor: 'gray.200',
        color: 'gray.600',
        marginInlineStart: '0',
        marginInlineEnd: { lg: '6px', xl: '8px' },
        flexShrink: 0,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
      },
      '.chakra-button__icon:last-of-type': {
        color: 'gray.500',
        marginInlineStart: { lg: '4px', xl: '6px' },
        marginInlineEnd: '0'
      },
      '&:hover .chakra-button__icon:first-of-type': {
        bg: 'white',
        borderColor: 'gray.300',
        color: 'gray.800'
      }
    }
  };
  const dropdownNavButtonStyles = {
    ...navButtonStyles,
    _expanded: {
      bg: 'teal.700',
      color: 'white',
      borderColor: 'teal.700',
      boxShadow: 'var(--gm-shadow-3)'
    },
    sx: {
      ...navButtonStyles.sx,
      '&[aria-expanded=true] .chakra-button__icon:first-of-type': {
        bg: 'whiteAlpha.200',
        borderColor: 'whiteAlpha.300',
        color: 'white'
      },
      '&[aria-expanded=true] .chakra-button__icon:last-of-type': {
        color: 'whiteAlpha.900'
      }
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
    borderColor: 'teal.100',
    color: 'gray.800',
    boxShadow: 'sm',
    _hover: {
      bg: 'teal.50',
      borderColor: 'teal.200',
      transform: 'translateY(-1px)',
      boxShadow: 'md'
    },
    _active: {
      bg: 'teal.100',
      transform: 'translateY(0)'
    },
    _focusVisible: {
      boxShadow: 'var(--gm-focus-ring)'
    }
  };

  const renderNavIcon = (name: string) => {
    switch (name) {
      case 'navigation.maps':
      case 'navigation.explore':
        return (
          <Icon viewBox="0 0 24 24" boxSize={{ base: 4, md: 3.5 }} color="currentColor">
            <path
              d="M9 20l-5-2.5V4l5 2.5 6-3 5 2.5V20l-5-2.5-6 3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.store':
      case 'navigation.travelTools':
      case 'navigation.plan':
        return (
          <Icon viewBox="0 0 24 24" boxSize={{ base: 4, md: 3.5 }} color="currentColor">
            <path
              d="M6 9h12l-1 11H7L6 9Zm2-4h8l1 4H7l1-4Zm-3 4h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.aboutUs':
        return (
          <Icon viewBox="0 0 24 24" boxSize={{ base: 4, md: 3.5 }} color="currentColor">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        );
      case 'navigation.itinerary':
        return (
          <Icon viewBox="0 0 24 24" boxSize={{ base: 4, md: 3.5 }} color="currentColor">
            <rect x="5" y="4" width="14" height="16" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <path d="M8 2v4M16 2v4M8 10h8M8 14h8" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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
      case 'navigation.searchAllPlaces':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </Icon>
        );
      case 'navigation.areasHub':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <path
              d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </Icon>
        );
      case 'navigation.collectionsHub':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <rect x="4" y="5" width="16" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="10" width="16" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="15" width="16" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </Icon>
        );
      case 'navigation.itinerary':
        return (
          <Icon viewBox="0 0 24 24" boxSize={3} color="blue.400">
            <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 2v4M16 2v4M8 11h8M8 15h5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

  const setLanguage = (lang: 'en' | 'el') => {
    if (i18n.language === lang) return;
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const resolveNavigationTarget = (href: string) => {
    if (href.startsWith('/')) {
      return href;
    }

    if (href.startsWith('#')) {
      return `/${href}`;
    }

    return `/#${href}`;
  };

  const handleNavigation = async (href?: string) => {
    if (!href) {
      return;
    }

    const target = resolveNavigationTarget(href);

    try {
      await router.push(target);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = target;
      }
    } finally {
      onClose();
      setMenuOpen(false);
      setOpenMobileSection(null);
    }
  };

  return (
    <Box as="header" bg={bg} shadow="xs" position="sticky" top="0" zIndex="50" w="full" borderBottom="1px solid" borderColor="gray.200">
      {/* Top Bar */}
      <Flex
        bg="var(--gm-sea-700)"
        color="white"
        px={{ base: 3, md: 8 }}
        py={{ base: 1.5, md: 1.5 }}
        align="center"
        justify="space-between"
        flexWrap="nowrap"
        gap={{ base: 2, md: 3 }}
        minH={{ base: '40px', md: '40px' }}
      >
        <HStack spacing={{ base: 1, md: 3 }} flex="0 0 auto" minW="0">
          <HStack
            spacing={0.5}
            bg="white"
            border="1px solid"
            borderColor="whiteAlpha.500"
            borderRadius="lg"
            p={0.5}
            boxShadow="sm"
            minH={{ base: '28px', md: '34px' }}
            flexShrink={0}
          >
            <Text
              display={{ base: 'none', md: 'inline' }}
              color="gray.700"
              fontSize="xs"
              px={2}
              fontWeight="semibold"
            >
              {t('language.label', 'Language')}
            </Text>
            <Button
              size="xs"
              onClick={() => setLanguage('en')}
              bg={i18n.language === 'en' ? 'var(--gm-sea-700)' : 'transparent'}
              color={i18n.language === 'en' ? 'white' : 'gray.700'}
              borderRadius="full"
              fontWeight="bold"
              fontSize={{ base: '10px', md: 'xs' }}
              px={{ base: 2, md: 3 }}
              h={{ base: '24px', md: '28px' }}
              minW={{ base: '36px', md: '40px' }}
              _hover={{ bg: i18n.language === 'en' ? 'var(--gm-sea-500)' : 'gray.100' }}
              _active={{ bg: i18n.language === 'en' ? 'var(--gm-sea-500)' : 'gray.200' }}
              aria-label={t('language.english', 'English')}
            >
              <Box
                as="span"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="sm"
                overflow="hidden"
                boxShadow="inset 0 0 0 1px rgba(0,0,0,0.12)"
                w={{ base: '20px', md: '22px' }}
                h={{ base: '14px', md: '15px' }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 60 30" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
                  <rect width="60" height="30" fill="#012169" />
                  <path d="M0 0 L25 12.5 M35 17.5 L60 30 M60 0 L35 12.5 M25 17.5 L0 30" stroke="#FFFFFF" strokeWidth="6" />
                  <path d="M0 0 L25 12.5 M35 17.5 L60 30 M60 0 L35 12.5 M25 17.5 L0 30" stroke="#C8102E" strokeWidth="4" />
                  <path d="M30 0 V30 M0 15 H60" stroke="#FFFFFF" strokeWidth="10" />
                  <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
                </svg>
              </Box>
            </Button>
            <Button
              size="xs"
              onClick={() => setLanguage('el')}
              bg={i18n.language === 'el' ? 'var(--gm-sea-700)' : 'transparent'}
              color={i18n.language === 'el' ? 'white' : 'gray.700'}
              borderRadius="full"
              fontWeight="bold"
              fontSize={{ base: '10px', md: 'xs' }}
              px={{ base: 2, md: 3 }}
              h={{ base: '24px', md: '28px' }}
              minW={{ base: '36px', md: '40px' }}
              _hover={{ bg: i18n.language === 'el' ? 'var(--gm-sea-500)' : 'gray.100' }}
              _active={{ bg: i18n.language === 'el' ? 'var(--gm-sea-500)' : 'gray.200' }}
              aria-label={t('language.greek', 'Greek')}
            >
              <Box
                as="span"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="sm"
                overflow="hidden"
                boxShadow="inset 0 0 0 1px rgba(0,0,0,0.12)"
                w={{ base: '20px', md: '22px' }}
                h={{ base: '14px', md: '15px' }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 27 18" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
                  <rect width="27" height="18" fill="#0D5EAF" />
                  <rect y="2" width="27" height="2" fill="#FFFFFF" />
                  <rect y="6" width="27" height="2" fill="#FFFFFF" />
                  <rect y="10" width="27" height="2" fill="#FFFFFF" />
                  <rect y="14" width="27" height="2" fill="#FFFFFF" />
                  <rect width="10" height="10" fill="#0D5EAF" />
                  <rect x="4" width="2" height="10" fill="#FFFFFF" />
                  <rect y="4" width="10" height="2" fill="#FFFFFF" />
                </svg>
              </Box>
            </Button>
          </HStack>
          
          {/* PWA Install Button */}
          {((isInstallable && !isInstalled && !isStandalone) || 
            (isMobile && isIOS && !isInstalled && !isStandalone) || 
            process.env.NODE_ENV === 'development') && isOnline && (
            <Button
              size={{ base: "xs", md: "sm" }}
              bgGradient="linear(to-r, teal.700, cyan.700)"
              color="white"
              _hover={{ 
                bgGradient: "linear(to-r, teal.600, cyan.600)",
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
              boxShadow="var(--gm-shadow-1)"
              minW="0"
              flexShrink={0}
              display={{ base: 'none', sm: 'inline-flex' }}
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

        <Button
          onClick={onOpen}
          variant="unstyled"
          flex={{ base: '1 1 auto', lg: '1' }}
          maxW={{ base: 'none', sm: '190px', md: '300px' }}
          minW="0"
          h={{ base: '34px', md: '36px' }}
          bg="white"
          border="1px solid"
          borderColor="whiteAlpha.800"
          color="gray.800"
          borderRadius="lg"
          px={{ base: 3, md: 4 }}
          display="flex"
          alignItems="center"
          gap={{ base: 1.5, md: 2.5 }}
          textAlign="left"
          boxShadow="var(--gm-shadow-1)"
          _hover={{ bg: 'gray.100', borderColor: 'white' }}
          _active={{ bg: 'gray.200' }}
          _focusVisible={{ boxShadow: 'var(--gm-focus-ring)' }}
          order={{ base: 0, lg: 0 }}
          mt={{ base: 0, md: 0 }}
          aria-label={t('search.openSearch', 'Open search')}
          id="header-search"
        >
          <SearchIcon color="gray.500" boxSize={{ base: '12px', md: '14px' }} flexShrink={0} />
          <Text
            fontSize={{ base: '12px', md: 'sm' }}
            lineHeight="1"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            color="gray.700"
            fontWeight="semibold"
          >
            {t('header.searchHint', 'Find places')}
          </Text>
        </Button>
      </Flex>

      {/* Main Header */}
      <Box px={{ base: 3, md: 8 }} py={{ base: 3, md: 3.5 }}>
        <Flex align="center" justify="space-between" wrap="nowrap" gap={3}>
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
              fontSize={{ base: 'lg', md: '2xl', lg: '3xl' }}
              fontWeight="bold"
              color={textColor}
              textShadow="0 2px 8px rgba(0,0,0,0.12)"
              letterSpacing="tight"
              noOfLines={1}
              maxW={{ base: '200px', sm: '260px', md: 'none' }}
              className="leading-tight tracking-tight"
            >
              {t('company.name')}
            </Text>
          </HStack>

          {/* Desktop Nav */}
          <HStack spacing={{ lg: 2, xl: 4 }} display={{ base: 'none', lg: 'flex' }} flexWrap="nowrap" overflowX="auto">
            {visibleNavigation.map((item) =>
              !item.submenu ? (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => handleNavigation(item.href)}
                  leftIcon={renderNavIcon(item.name) || undefined}
                  {...navButtonStyles}
                  color="gray.700"
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
                    {...dropdownNavButtonStyles}
                    color="gray.700"
                    sx={{
                      ...(dropdownNavButtonStyles.sx || {}),
                      '.chakra-button__icon:last-of-type': {
                        color: 'currentColor',
                        transition: 'transform 0.2s ease'
                      },
                      '&[aria-expanded=true] .chakra-button__icon:last-of-type': {
                        transform: 'rotate(180deg)'
                      }
                    }}
                  >
                    {t(item.name)}
                  </MenuButton>
                  <MenuList
                    bg="white"
                    border="1px solid"
                    borderColor="blue.100"
                    shadow="2xl"
                    py={2.5}
                    px={2}
                    borderRadius="2xl"
                    minW="240px"
                    mt={2}
                  >
                    {item.submenu.map((subItem) => (
                      <MenuItem
                        key={subItem.name}
                        onClick={() => handleNavigation(subItem.href)}
                        _hover={{ bg: 'blue.50', color: 'blue.700', transform: 'translateX(2px)' }}
                        _focus={{ bg: 'blue.50', color: 'blue.700' }}
                        fontSize="sm"
                        fontWeight="semibold"
                        px={3.5}
                        py={2.5}
                        borderRadius="lg"
                        transition="all 0.18s ease"
                      >
                        {renderSubNavIcon(subItem.name) ? (
                          <HStack spacing={2.5}>
                            <Box
                              display="inline-flex"
                              alignItems="center"
                              justifyContent="center"
                              w="20px"
                              h="20px"
                              borderRadius="md"
                              bg="gray.100"
                              border="1px solid"
                              borderColor="gray.200"
                              color="blue.500"
                              transition="background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease"
                              _groupHover={{ bg: 'white', borderColor: 'blue.200', color: 'blue.700' }}
                            >
                              {renderSubNavIcon(subItem.name)}
                            </Box>
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
            display={{ base: 'flex', lg: 'none' }}
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
                {t('navigation.explore', 'Explore')}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setMenuOpen(false);
                  setOpenMobileSection(null);
                }}
                borderRadius="full"
                color="gray.600"
                _hover={{ bg: 'gray.100' }}
              >
                {t('aria.closeMenu', 'Close Menu')}
              </Button>
            </Flex>
            <VStack spacing={2} align="stretch">
              {visibleNavigation.map((item) => (
                <Box key={item.name}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (item.submenu) {
                        setOpenMobileSection((current) => (current === item.name ? null : item.name));
                        return;
                      }
                      handleNavigation(item.href);
                    }}
                    leftIcon={renderNavIcon(item.name) || undefined}
                    rightIcon={item.submenu ? <ChevronDownIcon transform={openMobileSection === item.name ? 'rotate(180deg)' : 'none'} transition="transform 0.2s ease" /> : undefined}
                    {...mobileNavButtonStyles}
                  >
                    {t(item.name)}
                  </Button>
                  {item.submenu && openMobileSection === item.name && (
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
                          sx={{
                            '.chakra-button__icon:first-of-type': {
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              w: '20px',
                              h: '20px',
                              borderRadius: 'md',
                              bg: 'gray.100',
                              border: '1px solid',
                              borderColor: 'gray.200',
                              color: 'blue.500',
                              marginInlineEnd: '10px',
                              transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
                            },
                            '&:hover .chakra-button__icon:first-of-type': {
                              bg: 'white',
                              borderColor: 'blue.200',
                              color: 'blue.700'
                            }
                          }}
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
        <ModalContent maxW="95vw" my={{ base: 2, md: 6 }} maxH={{ base: '96vh', md: '90vh' }}>
          <ModalHeader>{t('header.searchTitle', 'Search')}</ModalHeader>
          <ModalCloseButton zIndex={2} bg="white" borderRadius="full" boxShadow="sm" />
          <ModalBody p={0} overflowY="auto">
            <Box p={4}>
              <SearchPage focusOnMount={isOpen} />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;
