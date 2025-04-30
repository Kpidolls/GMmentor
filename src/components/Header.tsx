'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  VStack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useDisclosure } from '@chakra-ui/react';
import React from 'react';
import config from '../config/index.json';

const Header = React.memo(() => {
  const { company } = config;
  const { logo } = company;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bg = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.200', 'gray.700');
  const submenuHover = useColorModeValue('gray.300', 'gray.600');

  const handleNavigation = (href?: string) => {
    if (href) {
      router.push(href.startsWith('/') ? href : `/#${href}`);
      onClose();
    }
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'el' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <Box as="header" bg={bg} shadow="md" position="sticky" top="0" zIndex="50" w="full">
      {/* Top Bar */}
      <Box bg="gray.800" py="2" px={{ base: 4, md: 6 }}>
        <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
          <Button
              variant="ghost"
              onClick={toggleLanguage}
              color="Lavender"
              _hover={{ bg: hoverBg, color: 'gray.400' }}
            >
              {i18n.language === 'en' ? 'Ελληνικά' : 'English'}
            </Button>
          <Box fontSize="md" color="white">
            {t('header.promo')}
          </Box>
          <HStack spacing="6">
            <Button variant="ghost" onClick={() => router.push('/login')} color="white" _hover={{ bg: hoverBg }}>
              {t('header.login')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/signup')}
              color="white"
              _hover={{ bg: hoverBg }}
            >
              {t('header.register')}
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Main Header */}
      <Box px={{ base: 4, md: 6 }} py="6">
        <Flex justify="space-between" align="center" wrap="wrap" maxW="container.xl" mx="auto">
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
          <HStack
            spacing="8"
            display={{ base: 'none', md: 'flex' }}
          >
            {config.navigation.map((item) =>
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
                      <Button
                        as="div"
                        key={subItem.name}
                        variant="ghost"
                        justifyContent="flex-start"
                        w="full"
                        textAlign="left"
                        onClick={() => handleNavigation(subItem.href)}
                        _hover={{
                          bg: submenuHover,
                          textDecoration: 'underline',
                          fontWeight: 'medium',
                        }}
                        px="4"
                        py="2"
                        fontSize="sm"
                        color={textColor}
                      >
                        {t(subItem.name)}
                      </Button>
                    ))}
                  </MenuList>
                </Menu>
              )
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
            aria-label={isOpen ? t('aria.closeMenu') : t('aria.openMenu')}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            display={{ base: 'flex', md: 'none' }}
            _hover={{ bg: hoverBg }}
          />
        </Flex>

        {/* Mobile Navigation */}
        {isOpen && (
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
              {config.navigation.map((item) => (
                <Box key={item.name} w="full">
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => handleNavigation(item.href)}
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
                          onClick={() => handleNavigation(subItem.href)}
                          _hover={{
                            bg: submenuHover,
                            textDecoration: 'underline',
                            fontWeight: 'medium',
                          }}
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
    </Box>
  );
});

export default Header;
