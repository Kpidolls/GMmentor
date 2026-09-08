import NextLink from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
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
                {item.label}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink as="span" color="gray.600" cursor="default" _hover={{ textDecoration: 'none' }}>
                {item.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}
