const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Running InspectBae Build & Asset Verification...\n');

const distDir = path.join(__dirname, '..', 'dist');

// 1. Check required extension files
const requiredFiles = [
  'manifest.json',
  'content.js',
  'background.js',
  'popup.html',
  'popup.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  assert(fs.existsSync(filePath), `Missing expected build artifact: ${file}`);
  const stats = fs.statSync(filePath);
  assert(stats.size > 0, `File is empty: ${file}`);
  console.log(`✓ Verified file: ${file} (${stats.size} bytes)`);
}

// 2. Validate manifest.json structure
const manifestContent = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
assert.strictEqual(manifestContent.manifest_version, 3, 'Manifest version must be 3');
assert.strictEqual(manifestContent.name, 'InspectBae', 'Manifest name must be InspectBae');
assert(manifestContent.content_scripts && manifestContent.content_scripts.length > 0, 'Must have content_scripts configured');
assert(manifestContent.background && manifestContent.background.service_worker, 'Must have background service worker');
console.log('✓ Validated Manifest V3 schema and properties');

// 3. Check content.js bundle content
const contentJs = fs.readFileSync(path.join(distDir, 'content.js'), 'utf8');
assert(contentJs.includes('ib-fab'), 'content.js must contain FAB logic');
assert(contentJs.includes('ib-overlay-container'), 'content.js must contain overlay logic');
assert(contentJs.includes('ib-tooltip-card'), 'content.js must contain tooltip logic');
console.log('✓ Verified content.js contains all engine components');

console.log('\nAll build verifications passed cleanly with 0 errors! 🎉');
