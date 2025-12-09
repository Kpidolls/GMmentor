/**
 * Generate IndexNow API Key
 * Creates a 32-character hexadecimal key for IndexNow authentication
 * 
 * Usage: node scripts/generate-indexnow-key.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateKey() {
  return crypto.randomBytes(16).toString('hex');
}

function main() {
  const key = generateKey();
  const keyFilePath = path.join(process.cwd(), 'public', `${key}.txt`);
  
  // Create key file in public directory
  fs.writeFileSync(keyFilePath, key);
  
  console.log('\n=================================');
  console.log('✅ IndexNow Key Generated!');
  console.log('=================================\n');
  console.log(`Key: ${key}\n`);
  console.log('Files created:');
  console.log(`  📄 public/${key}.txt\n`);
  console.log('Next steps:');
  console.log('1. Add this to your .env.local file:');
  console.log(`   NEXT_PUBLIC_INDEXNOW_KEY=${key}\n`);
  console.log('2. After deployment, verify the key is accessible at:');
  console.log(`   https://googlementor.com/${key}.txt\n`);
  console.log('3. Run npm run build to test IndexNow submission\n');
}

main();
