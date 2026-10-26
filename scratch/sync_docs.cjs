const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../client/dist');
const docsDir = path.resolve(__dirname, '../docs');

console.log('Syncing from', distDir, 'to', docsDir);

if (!fs.existsSync(distDir)) {
  console.error('client/dist does not exist! Run build first.');
  process.exit(1);
}

// 1. Clean docs/assets
const docsAssetsDir = path.join(docsDir, 'assets');
if (fs.existsSync(docsAssetsDir)) {
  fs.rmSync(docsAssetsDir, { recursive: true, force: true });
}
fs.mkdirSync(docsAssetsDir, { recursive: true });

// 2. Copy client/dist/assets to docs/assets
const distAssetsDir = path.join(distDir, 'assets');
if (fs.existsSync(distAssetsDir)) {
  fs.cpSync(distAssetsDir, docsAssetsDir, { recursive: true });
}

// 3. Copy client/dist/index.html to docs/index.html and docs/404.html
const distIndex = path.join(distDir, 'index.html');
const docsIndex = path.join(docsDir, 'index.html');
const docs404 = path.join(docsDir, '404.html');

fs.copyFileSync(distIndex, docsIndex);
fs.copyFileSync(distIndex, docs404);

// 4. Ensure .nojekyll exists
const nojekyll = path.join(docsDir, '.nojekyll');
if (!fs.existsSync(nojekyll)) {
  fs.writeFileSync(nojekyll, '');
}

// 5. Ensure docs/images exists and has public images from client/public/images
const publicImagesDir = path.resolve(__dirname, '../client/public/images');
const docsImagesDir = path.join(docsDir, 'images');
if (fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(docsImagesDir, { recursive: true });
  fs.cpSync(publicImagesDir, docsImagesDir, { recursive: true });
}

console.log('Synced successfully to docs/!');
