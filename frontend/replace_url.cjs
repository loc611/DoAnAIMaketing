const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else {
            if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walkDir('d:/BaiTapAIMaketing/AI3D/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace 'http://localhost:7000/something' with `${import.meta.env.VITE_API_URL}/something`
    content = content.replace(/'http:\/\/localhost:7000(.*?)'/g, "`\\${import.meta.env.VITE_API_URL}$1`");
    
    // Replace "http://localhost:7000/something" with `${import.meta.env.VITE_API_URL}/something`
    content = content.replace(/"http:\/\/localhost:7000(.*?)"/g, "`\\${import.meta.env.VITE_API_URL}$1`");
    
    // Replace `http://localhost:7000/something` with `${import.meta.env.VITE_API_URL}/something`
    content = content.replace(/`http:\/\/localhost:7000(.*?)`/g, "`\\${import.meta.env.VITE_API_URL}$1`");
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
