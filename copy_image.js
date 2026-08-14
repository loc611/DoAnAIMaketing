const fs = require('fs');
const src = 'D:\\BaiTapAIMaketing\\AI3D\\imga\\iphone\\camera.png';
const dest = 'D:\\BaiTapAIMaketing\\AI3D\\frontend\\public\\images\\iphone17_pro\\camera.png';

try {
  fs.copyFileSync(src, dest);
  console.log('Copied successfully!');
} catch (e) {
  console.error('Error copying file:', e);
}
