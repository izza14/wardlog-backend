const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, swapController.getSwapRequests);
router.post('/', requireAuth, swapController.createSwapRequest);
router.put('/:id/approve', requireAuth, requireAdmin, swapController.approveSwap); // Admin approval[cite: 1, 2]
router.put('/:id/reject', requireAuth, requireAdmin, swapController.rejectSwap);

module.exports = router;