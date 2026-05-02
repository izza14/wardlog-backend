const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { requireAuth, requireAdmin } = require('../middleware/auth'); // Shared auth middleware

// All roles can view notices[cite: 1, 2]
router.get('/', requireAuth, noticeController.getNotices);

// Admin only can create and delete notices[cite: 1]
router.post('/', requireAuth, requireAdmin, noticeController.createNotice);

// Add this quick delete function to your noticeController.js if you haven't yet!
exports.deleteNotice = async (req, res, next) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: null, message: 'Notice deleted' });
  } catch (error) {
    next(error);
  }
};
router.delete('/:id', requireAuth, requireAdmin, noticeController.deleteNotice);

module.exports = router;