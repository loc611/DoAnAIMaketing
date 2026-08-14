const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'client', 'src', 'pages');
const filesToUpdate = ['Mac.jsx', 'Iphone.jsx', 'Support.jsx', 'Orders.jsx', 'PreOrder.jsx', 'CrmDashboard.jsx', 'ProductDetail.jsx'];

for (const file of filesToUpdate) {
  const fullPath = path.join(pagesDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace top-level bg
    content = content.replace(/className=\"min-h-screen bg-\[#000000\] text-\[#f5f5f7\]/g, 'className=\"min-h-screen bg-gray-50 text-black');
    content = content.replace(/className=\"min-h-screen bg-black text-white/g, 'className=\"min-h-screen bg-gray-50 text-black');
    content = content.replace(/min-h-screen bg-gray-900 text-white/g, 'min-h-screen bg-gray-50 text-black');
    
    // Replace section bgs
    content = content.replace(/bg-\[#010101\]/g, 'bg-white');
    content = content.replace(/bg-\[#1c1c1e\]/g, 'bg-white');
    content = content.replace(/bg-black\/50/g, 'bg-white\/50');
    content = content.replace(/bg-black\/40/g, 'bg-white\/40');
    content = content.replace(/bg-gray-800/g, 'bg-white');
    content = content.replace(/bg-gray-900/g, 'bg-gray-50');
    
    // Replace text colors carefully
    content = content.replace(/text-white/g, 'text-black');
    content = content.replace(/text-\[#f5f5f7\]/g, 'text-black');
    
    // Replace borders
    content = content.replace(/border-white\/10/g, 'border-black\/10');
    content = content.replace(/border-white\/20/g, 'border-black\/20');
    content = content.replace(/border-gray-700/g, 'border-gray-200');
    
    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
  }
}
