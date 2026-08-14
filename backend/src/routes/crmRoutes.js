const express = require('express');
const router = express.Router();
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
router.post('/products', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'MANAGER']), productController.createProduct);

module.exports = router;
