const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { createPNG } = require('./generate-icons');

const isWatch = process.argv.includes('--watch');

async function build() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Copy or generate icons
  const iconsDir = path.join(distDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const srcIconsDir = path.join(__dirname, 'src', 'icons');
  if (fs.existsSync(path.join(srcIconsDir, 'icon16.png'))) {
    for (const size of [16, 48, 128]) {
      const name = `icon${size}.png`;
      fs.copyFileSync(path.join(srcIconsDir, name), path.join(iconsDir, name));
    }
    console.log('✓ Copied brand extension icons from src/icons');
  } else {
    createPNG(16, path.join(iconsDir, 'icon16.png'));
    createPNG(48, path.join(iconsDir, 'icon48.png'));
    createPNG(128, path.join(iconsDir, 'icon128.png'));
    console.log('✓ Generated fallback extension icons');
  }

  // 2. Copy static files
  fs.copyFileSync(
    path.join(__dirname, 'src', 'manifest.json'),
    path.join(distDir, 'manifest.json')
  );
  fs.copyFileSync(
    path.join(__dirname, 'src', 'popup.html'),
    path.join(distDir, 'popup.html')
  );
  console.log('✓ Copied manifest.json and popup.html');

  // 3. Build bundle with esbuild
  const buildOptions = {
    entryPoints: [
      path.join(__dirname, 'src', 'content.ts'),
      path.join(__dirname, 'src', 'background.ts'),
      path.join(__dirname, 'src', 'popup.ts'),
    ],
    bundle: true,
    outdir: distDir,
    format: 'iife',
    target: ['chrome100', 'edge100'],
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    logLevel: 'info',
  };

  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('✓ Extension scripts built successfully');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
