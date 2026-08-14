const fs = require('fs');

function fixMojibake(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const buffer = Buffer.from(content, 'latin1');
    const decoded = buffer.toString('utf8');
    fs.writeFileSync(filePath, decoded, 'utf8');
    console.log('Fixed', filePath);
  } catch (e) {
    console.error('Error fixing', filePath, e);
  }
}

const files = [
  "src/components/ui/PremiumProductGrid.jsx",
  "src/components/ui/Store3DCoverFlow.jsx",
  "src/features/iphone14/pages/IPhone14ProMaxLanding.jsx",
  "src/features/iphone15/pages/IPhone15ProLanding.jsx",
  "src/features/iphone16/components/A18ProDieMap.jsx",
  "src/features/iphone16/pages/IPhone16ProMaxLanding.jsx",
  "src/features/iphone17/pages/IPhone17ProLanding.jsx",
  "src/pages/Iphone.jsx",
  "src/pages/Store.jsx"
];

files.forEach(f => fixMojibake(f));
