const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(filePath, content);
}

// src/app.js
replaceInFile('src/app.js', [
    [/require\('\.\/routes\/auth\.routes'\)/g, "require('./modules/auth/auth.routes')"],
    [/require\('\.\/routes\/order\.routes'\)/g, "require('./modules/order/order.routes')"],
    [/require\('\.\/routes\/user\.routes'\)/g, "require('./modules/user/user.routes')"],
    [/require\('\.\/routes\/chat\.routes'\)/g, "require('./modules/chat/chat.routes')"]
]);

// src/modules/auth/auth.routes.js
replaceInFile('src/modules/auth/auth.routes.js', [
    [/require\('\.\.\/controllers\/auth\.controller'\)/g, "require('./auth.controller')"],
    [/require\('\.\.\/middleware\/authMiddleware'\)/g, "require('../../middlewares/authMiddleware')"],
    [/require\('\.\.\/middlewares\/validate\.middleware'\)/g, "require('../../middlewares/validate.middleware')"],
    [/require\('\.\.\/validations\/auth\.validation'\)/g, "require('./auth.validation')"]
]);

// src/modules/auth/auth.controller.js
replaceInFile('src/modules/auth/auth.controller.js', [
    [/require\('\.\.\/config\/db'\)/g, "require('../../config/db')"]
]);

// src/modules/user/user.routes.js
replaceInFile('src/modules/user/user.routes.js', [
    [/require\('\.\.\/controllers\/user\.controller'\)/g, "require('./user.controller')"],
    [/require\('\.\.\/middleware\/authMiddleware'\)/g, "require('../../middlewares/authMiddleware')"]
]);

// src/modules/user/user.controller.js
replaceInFile('src/modules/user/user.controller.js', [
    [/require\('\.\.\/config\/db'\)/g, "require('../../config/db')"]
]);

// src/modules/order/order.routes.js
replaceInFile('src/modules/order/order.routes.js', [
    [/require\('\.\.\/controllers\/order\.controller'\)/g, "require('./order.controller')"],
    [/require\('\.\.\/middleware\/authMiddleware'\)/g, "require('../../middlewares/authMiddleware')"]
]);

// src/modules/order/order.controller.js
replaceInFile('src/modules/order/order.controller.js', [
    [/require\('\.\.\/config\/db'\)/g, "require('../../config/db')"]
]);

// src/modules/chat/chat.routes.js
replaceInFile('src/modules/chat/chat.routes.js', [
    [/require\('\.\.\/controllers\/chat\.controller'\)/g, "require('./chat.controller')"]
]);

// src/modules/chat/chat.controller.js
replaceInFile('src/modules/chat/chat.controller.js', [
    [/require\('\.\.\/config\/db'\)/g, "require('../../config/db')"]
]);

// src/modules/sample/sample_pg.controller.js
replaceInFile('src/modules/sample/sample_pg.controller.js', [
    [/require\('\.\.\/config\/db'\)/g, "require('../../config/db')"],
    [/require\('\.\.\/services\/db\.service'\)/g, "require('../../models/db.service')"]
]);

// src/models/db.service.js
replaceInFile('src/models/db.service.js', [
    [/require\('\.\.\/config\/db'\)/g, "require('../config/db')"]
]);

console.log('Imports fixed.');
