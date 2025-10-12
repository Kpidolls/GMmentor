# Restaurant Categories System

## Overview
The `NearestGreekRestaurant` component now supports multiple restaurant categories with dynamic theming. This makes it easy to add new restaurant types in the future.

## Current Implementation
Currently configured with:
- **Greek Tavernas** (🏛️) - Blue theme (#0878fe, #0053b8)

## How to Add New Categories

### 1. Create Data File
Create a new JSON file like `cheapEats.json` in `/src/data/`:

```json
[
  {
    "name": "McDonald's",
    "url": "https://maps.app.goo.gl/example",
    "address": "123 Main St, City",
    "lat": 37.7749,
    "lng": -122.4194
  }
]
```

### 2. Update Component Imports
Add the import at the top of `NearestGreekRestaurant.tsx`:

```typescript
import cheapEats from '../data/cheapEats.json';
```

### 3. Add Category Configuration
Add to the `restaurantCategories` array:

```typescript
{
  id: 'cheap',
  name: 'Budget Eats',
  icon: '💰',
  description: 'Great food at affordable prices',
  data: cheapEats as Restaurant[],
  color: {
    primary: '#10b981',    // Green theme
    secondary: '#059669',
    accent: '#047857'
  }
}
```

## Color Themes
Choose colors that fit the category:

- **Greek Tavernas**: Blue (#0878fe, #0053b8) - Mediterranean/Ocean theme
- **Budget Eats**: Green (#10b981, #059669) - Money/Savings theme  
- **Fine Dining**: Purple (#8b5cf6, #7c3aed) - Luxury theme
- **Fast Food**: Orange (#f59e0b, #d97706) - Energy/Quick theme
- **Coffee Shops**: Brown (#92400e, #78350f) - Coffee bean theme

## Features
- **Dynamic UI**: Colors, icons, and text adapt to selected category
- **Category Switching**: Users can switch between categories (when multiple exist)
- **Consistent Branding**: Each category maintains its visual identity throughout the UI
- **Scalable**: Easy to add unlimited new categories

## Future Categories Ideas
- `cheapEats.json` - Budget-friendly restaurants
- `fineDining.json` - Upscale restaurants  
- `coffeeShops.json` - Cafes and coffee shops
- `fastFood.json` - Quick service restaurants
- `vegetarian.json` - Plant-based restaurants
- `seafood.json` - Fish and seafood specialists

## UI Adaptations
The component automatically adapts:
- Header icons and titles
- Button colors and gradients
- Progress indicators
- Hover effects
- Navigation elements
- Search button styling