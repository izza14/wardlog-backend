const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth'); // Shared auth[cite: 1]

// All admin routes are protected by requireAdmin middleware[cite: 1]
router.get('/dashboard', requireAuth, requireAdmin, adminController.getAdminDashboard);
router.get('/settings', requireAuth, requireAdmin, adminController.getSettings);
router.put('/settings', requireAuth, requireAdmin, adminController.updateSettings);

module.exports = router;