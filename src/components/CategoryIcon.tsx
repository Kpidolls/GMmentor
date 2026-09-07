'use client';

import type { IconType } from 'react-icons';
import {
  LuCakeSlice,
  LuChurch,
  LuCoffee,
  LuDollarSign,
  LuFish,
  LuGlobe,
  LuLandmark,
  LuMartini,
  LuSalad,
  LuUsers,
  LuUtensils,
  LuWine,
} from 'react-icons/lu';

const categoryIcons: Record<string, IconType> = {
  attractions: LuLandmark,
  'greek-restaurants': LuUtensils,
  desserts: LuCakeSlice,
  'family-friendly': LuUsers,
  'coffee-brunch': LuCoffee,
  'fish-tavernas': LuFish,
  'monasteries-churches': LuChurch,
  italian: LuUtensils,
  'cheap-eats': LuDollarSign,
  asian: LuGlobe,
  burgers: LuUtensils,
  vegetarian: LuSalad,
  mexican: LuUtensils,
  'luxury-dining': LuMartini,
  'rooftop-lounges': LuGlobe,
  'wineries-vineyards': LuWine,
};

interface CategoryIconProps {
  categoryId: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ categoryId, className, size = 40 }: CategoryIconProps) {
  const Icon = categoryIcons[categoryId] ?? LuUtensils;

  return (
    <Icon
      aria-hidden="true"
      className={className}
      size={size}
      strokeWidth={1.75}
    />
  );
}
