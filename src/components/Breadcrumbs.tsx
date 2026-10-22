import NextLink from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t } = useTranslation();
  const translateLabel = (label: string) => {
    if (label === 'Home') return t('breadcrumbs.home', 'Home');
    if (label === 'Areas') return t('breadcrumbs.areas', 'Areas');
    return label;
  };
  const parent = [...items.slice(0, -1)].reverse().find((item) => item.href);

  return (
    <>
      {parent?.href && (
        <BackButton
          fallbackHref={parent.href}
          label={`${t('common.back', 'Back')} · ${translateLabel(parent.label)}`}
        />
      )}
      <Breadcrumb
        mb={4}
        fontSize="sm"
        color="gray.600"
        separator="/"
        spacing={2}
        flexWrap="wrap"
      >
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <BreadcrumbItem key={`${item.label}-${index}`} isCurrentPage={isCurrent}>
              {item.href && !isCurrent ? (
                <BreadcrumbLink as={NextLink} href={item.href} color="blue.600">
                  {translateLabel(item.label)}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbLink as="span" color="gray.600" cursor="default" _hover={{ textDecoration: 'none' }}>
                  {translateLabel(item.label)}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </>
  );
}
