const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Cấu hình Multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const { authenticateToken, checkRole } = require('../middlewares/authMiddleware');

// Controllers
const leadController = require('../controllers/leadController');
const dashboardController = require('../controllers/dashboardController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');

// ==========================================
// 1. LEADS & TRACKING
// ==========================================
router.post('/track', leadController.trackLead);

router.get('/leads', authenticateToken, leadController.getLeads);
router.post('/leads', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'sales', 'SALES']), leadController.createLead);
router.put('/leads/bulk-assign', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'sales', 'SALES']), leadController.bulkAssign);

router.get('/leads/:id', authenticateToken, leadController.getLeadById);
router.post('/leads/:id/activities', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'sales', 'SALES']), leadController.addManualActivity);
router.patch('/leads/:id', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'sales', 'SALES']), leadController.updateLead);

// ==========================================
// 2. DASHBOARDS
// ==========================================
router.get('/dashboard', authenticateToken, dashboardController.getOperationalDashboard);
router.get('/executive', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'MANAGER']), dashboardController.getExecutiveDashboard);

// ==========================================
// 3. USERS & PERMISSIONS
// ==========================================
router.get('/users', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'MANAGER']), userController.getUsers);
router.post('/users', authenticateToken, checkRole(['admin', 'SUPER_ADMIN']), userController.createUser);
router.patch('/users/:id', authenticateToken, checkRole(['admin', 'SUPER_ADMIN']), userController.updateUser);
router.patch('/users/:id/role', authenticateToken, checkRole(['admin', 'SUPER_ADMIN']), userController.updateUser);
router.delete('/users/:id', authenticateToken, checkRole(['admin', 'SUPER_ADMIN']), userController.deleteUser);
router.put('/permission-matrix', authenticateToken, checkRole(['admin', 'SUPER_ADMIN']), userController.updatePermissionMatrix);

// ==========================================
// 4. PRODUCTS
// ==========================================
// GET products can be public for storefront
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'MANAGER']), productController.createProduct);
router.put('/products/:id', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'MANAGER']), productController.updateProduct);
router.delete('/products/:id', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'MANAGER']), productController.deleteProduct);

// ==========================================
// 5. UPLOADS
// ==========================================
router.post('/upload', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'MANAGER']), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file nào được tải lên.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

module.exports = router;
