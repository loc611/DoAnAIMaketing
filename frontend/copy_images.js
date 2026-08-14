const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/PC/.gemini/antigravity-ide/brain/dea999b0-2b4a-40d7-8bf7-5e134a66844e';
const destDir = path.resolve('d:/BaiTapAIMaketing/AI3D/frontend/public/images/premium_grid');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(brainDir);
const images = [
  'iphone17_promax',
  'iphone16_promax',
  'iphone15_promax',
  'iphone14_promax',
  'iphone13_promax',
  'iphone12_promax',
];

images.forEach((prefix) => {
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.png'));
  if (match) {
    fs.copyFileSync(path.join(brainDir, match), path.join(destDir, `${prefix}.png`));
    console.log(`Copied ${prefix}.png`);
  }
});
