const express = require('express');
const router = express.Router();
const wardDashboardController = require('../controllers/wardDashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, wardDashboardController.getWardDashboard);

module.exports = router;