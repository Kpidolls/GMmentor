// Simple PNG icon generator for immediate PWA functionality
// This creates colored canvas icons as placeholders

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(0, 0, size, size);
    
    // Border radius effect (simplified)
    ctx.globalCompositeOperation = 'destination-out';
    const radius = size * 0.1;
    
    // Text
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GM', size/2, size/2);
    
    // Map pin
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.25, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Download link
    const link = document.createElement('a');
    link.download = `icon-${size}x${size}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

console.log('Generated placeholder icons! Check your downloads folder.');