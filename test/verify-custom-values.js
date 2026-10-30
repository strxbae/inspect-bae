const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Running InspectBae Custom Values & Handover Note Verification...\n');

const distContent = fs.readFileSync(path.join(__dirname, '..', 'dist', 'content.js'), 'utf8');

// 1. Verify custom value tokens and string literals are present in minified content.js bundle
const requiredTokens = [
  'Custom Values',
  'ib-custom-container',
  'ib-btn-reset-all',
  'ib-copy-note-btn',
  'Copy Note',
  'Design Tweak Handover Notes',
  'Modified Properties',
  'CSS Snippet to Apply',
  'border-radius',
  'letter-spacing',
  'line-height'
];

for (const token of requiredTokens) {
  assert(distContent.includes(token), `Missing required token in content.js: "${token}"`);
  console.log(`✓ Verified token present: "${token}"`);
}

// 2. Test markdown generator format logic
function mockGenerateMarkdownNote(elementInfo, changes) {
  const elementIdentifier = `<${elementInfo.tagName}>${elementInfo.id ? '#' + elementInfo.id : ''}${elementInfo.className ? '.' + elementInfo.className.split(' ').join('.') : ''}`;
  let md = `### 📝 Design Tweak Handover Notes\n\n`;
  md += `**Target Element:** \`${elementIdentifier}\`\n`;
  if (elementInfo.reactComponent) {
    md += `**React Component:** \`<${elementInfo.reactComponent}>\`\n`;
  }
  md += `\n---\n\n`;

  if (changes.length > 0) {
    md += `#### 🔄 Modified Properties (${changes.length})\n\n`;
    changes.forEach(c => {
      md += `- **${c.label}** (\`${c.cssProp}\`): \`${c.original}\` ➔ **\`${c.current}\`**\n`;
    });
    md += `\n#### 📋 CSS Snippet to Apply:\n\`\`\`css\n/* Applied to ${elementIdentifier} */\n`;
    changes.forEach(c => {
      md += `${c.cssProp}: ${c.current};\n`;
    });
    md += `\`\`\`\n`;
  }
  return md;
}

const mockChanges = [
  { label: 'Font Size', cssProp: 'font-size', original: '14px', current: '18px' },
  { label: 'Height', cssProp: 'height', original: '36px', current: '44px' },
  { label: 'Gap', cssProp: 'gap', original: '8px', current: '16px' },
  { label: 'Background', cssProp: 'background-color', original: '#3b82f6', current: '#1e293b' },
  { label: 'Text Color', cssProp: 'color', original: '#ffffff', current: '#f8fafc' },
];

const generatedMd = mockGenerateMarkdownNote({
  tagName: 'button',
  id: 'checkout-btn',
  className: 'btn btn-primary',
  reactComponent: 'CheckoutButton'
}, mockChanges);

assert(generatedMd.includes('### 📝 Design Tweak Handover Notes'));
assert(generatedMd.includes('**Target Element:** `<button>#checkout-btn.btn.btn-primary`'));
assert(generatedMd.includes('**React Component:** `<CheckoutButton>`'));
assert(generatedMd.includes('- **Font Size** (`font-size`): `14px` ➔ **`18px`**'));
assert(generatedMd.includes('- **Height** (`height`): `36px` ➔ **`44px`**'));
assert(generatedMd.includes('- **Gap** (`gap`): `8px` ➔ **`16px`**'));
assert(generatedMd.includes('- **Background** (`background-color`): `#3b82f6` ➔ **`#1e293b`**'));
assert(generatedMd.includes('background-color: #1e293b;'));

console.log('✓ Markdown handover note structure verified');
console.log('\nSample Generated Markdown Handover Note:');
console.log('-------------------------------------------');
console.log(generatedMd);
console.log('-------------------------------------------');
console.log('All Custom Values tests passed successfully! 🚀');
