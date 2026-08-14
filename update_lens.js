const fs = require('fs');
const path = 'c:\\Users\\PC\\Downloads\\lens_lightup_demo.html';

try {
  let content = fs.readFileSync(path, 'utf8');

  // Replace base64 image with the provided path
  content = content.replace(/<img src="data:image\/jpeg;base64,[^"]+"/g, '<img src="file:///D:/BaiTapAIMaketing/AI3D/imga/iphone/camera%20(2).png"');

  // Remove center-overlay CSS
  content = content.replace(/\/\* Center overlay \*\/[\s\S]*?\/\* progress ticks bottom \*\//, '/* progress ticks bottom */');

  // Remove center-overlay HTML if it exists
  content = content.replace(/<div class="center-overlay"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

  // Remove center-overlay JS
  content = content.replace(/const centerOverlay = document\.getElementById\('centerOverlay'\);/, '');
  content = content.replace(/if\s*\(centerOverlay\)\s*\{[\s\S]*?\}/, '');

  fs.writeFileSync(path, content, 'utf8');
  console.log("File updated successfully.");
} catch (e) {
  // If it's UTF-16, fallback to UTF-16LE
  try {
    let content = fs.readFileSync(path, 'utf16le');
    
    // Replace base64 image with the provided path
    content = content.replace(/<img src="data:image\/jpeg;base64,[^"]+"/g, '<img src="file:///D:/BaiTapAIMaketing/AI3D/imga/iphone/camera%20(2).png"');

    // Remove center-overlay CSS
    content = content.replace(/\/\* Center overlay \*\/[\s\S]*?\/\* progress ticks bottom \*\//, '/* progress ticks bottom */');

    // Remove center-overlay HTML if it exists
    content = content.replace(/<div class="center-overlay"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

    // Remove center-overlay JS
    content = content.replace(/const centerOverlay = document\.getElementById\('centerOverlay'\);/, '');
    content = content.replace(/if\s*\(centerOverlay\)\s*\{[\s\S]*?\}/, '');

    fs.writeFileSync(path, content, 'utf16le');
    console.log("File updated successfully (UTF-16LE).");
  } catch (e2) {
    console.error(e2);
  }
}
