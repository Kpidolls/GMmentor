# PWA Icon Quick Generator Script

# This PowerShell script will help you generate PWA icons
# Run this after you have your master icon ready

# Method 1: Using online converter (Recommended)
Write-Host "=== PWA Icon Generation for Google Maps Mentor ==="
Write-Host ""
Write-Host "OPTION 1: Online Generator (Easiest)"
Write-Host "1. Go to: https://www.pwabuilder.com/imageGenerator"
Write-Host "2. Upload your icon-master.svg or create one there"
Write-Host "3. Download the generated zip file"
Write-Host "4. Extract all icons to this folder"
Write-Host ""

# Method 2: Using Canva (Design-focused)
Write-Host "OPTION 2: Canva (Professional Design)"
Write-Host "1. Go to: https://www.canva.com"
Write-Host "2. Search for 'App Icon' templates"
Write-Host "3. Design your 512x512 icon with:"
Write-Host "   - Greek theme (columns, waves, islands)"
Write-Host "   - Blue color scheme (#0066CC)"
Write-Host "   - 'GM' or map pin element"
Write-Host "   - Clear visibility at small sizes"
Write-Host "4. Download as PNG (512x512)"
Write-Host "5. Use PWA Builder to generate all sizes"
Write-Host ""

# Method 3: Quick placeholder icons
Write-Host "OPTION 3: Quick Setup (Temporary)"
Write-Host "Creating placeholder icons for immediate testing..."
Write-Host ""

# Check if we can create basic icons
$iconExists = Test-Path "icon-master.svg"
if ($iconExists) {
    Write-Host "✅ Master SVG icon found!"
    Write-Host "📤 Upload icon-master.svg to PWA Builder for best results"
} else {
    Write-Host "⚠️  No master icon found"
    Write-Host "📝 Create your icon first, then run this script"
}

Write-Host ""
Write-Host "🎯 QUICK ACTION:"
Write-Host "Visit: https://www.pwabuilder.com/imageGenerator"
Write-Host "Upload your icon and download the complete PWA icon set!"
Write-Host ""
Write-Host "📁 Save all generated icons to:"
Write-Host "   C:\Users\Stavros\Desktop\GoogleMentor\GoogleMapsMentor\public\icons\"