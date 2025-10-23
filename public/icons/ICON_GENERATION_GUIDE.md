# PWA Icon Generation Guide

## Required Icon Sizes for Professional PWA

Your app needs icons in these specific sizes for different platforms:

### Essential Icons (Priority 1)
- `icon-192x192.png` - Main Android icon
- `icon-512x512.png` - High-res Android & desktop
- `icon-152x152.png` - iOS home screen
- `icon-180x180.png` - iOS high-resolution

### Complete Icon Set (Priority 2)
- `icon-72x72.png` - Android legacy
- `icon-96x96.png` - Android standard
- `icon-128x128.png` - Desktop small
- `icon-144x144.png` - Android high-res
- `icon-384x384.png` - Android extra high-res

### Shortcuts Icons (Priority 3)
- `shortcut-location.png` (96x96) - Location-based search
- `shortcut-cuisine.png` (96x96) - Cuisine browsing
- `shortcut-region.png` (96x96) - Athens areas
- `shortcut-store.png` (96x96) - Travel store

### Splash Screens for iOS (Priority 4)
- `iphone5_splash.png` (640x1136)
- `iphone6_splash.png` (750x1334)
- `iphoneplus_splash.png` (1242x2208)
- `iphonex_splash.png` (1125x2436)

## Design Guidelines

### Icon Design Principles
1. **Simple & Clear**: Should be recognizable at small sizes
2. **Brand Consistent**: Match your app's visual identity
3. **Maskable Ready**: Include 10% padding for adaptive icons
4. **High Contrast**: Visible on both light and dark backgrounds

### Color Scheme (Based on your app)
- Primary: #3b82f6 (blue)
- Background: #0f172a (dark)
- Accent: White/light colors

### Recommended Icon Content
For Googlementor travel app, consider:
- Greek-inspired elements (columns, waves, islands)
- Map pin or location marker
- "GM" monogram with travel theme
- Combination of map + Greek flag colors

## Tools for Icon Generation

### Option 1: Online PWA Icon Generators
- **PWA Builder** (Microsoft): https://www.pwabuilder.com/imageGenerator
- **Favicon.io**: https://favicon.io/favicon-generator/
- **RealFaviconGenerator**: https://realfavicongenerator.net/

### Option 2: Design Tools
- **Figma** (Free): Create 512x512 master icon, export all sizes
- **Canva** (Free): Use app icon templates
- **Adobe Illustrator**: Vector-based for perfect scaling

### Option 3: AI-Generated Icons
- **DALL-E**: "Create a minimalist app icon for Greek travel app"
- **Midjourney**: "App icon, travel, Greece, map pin, blue theme"
- **Stable Diffusion**: Travel app icon prompts

## Quick Setup Commands

After you have your master icon (512x512), you can batch resize:

### Using ImageMagick (if installed)
```bash
# Install ImageMagick first, then:
magick master-icon.png -resize 192x192 icon-192x192.png
magick master-icon.png -resize 152x152 icon-152x152.png
# ... repeat for all sizes
```

### Using online tools
1. Upload your master 512x512 icon to PWA Builder
2. Download the generated zip file
3. Extract to `/public/icons/` directory

## Testing Your Icons

1. **Chrome DevTools**: Application > Manifest (shows icon preview)
2. **Lighthouse**: PWA audit checks icon requirements
3. **Real Device**: Install PWA and check home screen

## Current Status

✅ Directory created: `/public/icons/`
⏳ **Next**: Add your actual icon files
⏳ Update manifest.json if icon names change

---

**Note**: The manifest.json already references these icon paths. Once you add the actual image files, your PWA icons will be complete!