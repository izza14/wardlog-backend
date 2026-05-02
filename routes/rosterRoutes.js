const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');
const { requireAuth, requireAdmin } = require('../middleware/auth'); // Shared auth middleware

// GET /api/roster - All authenticated users can view the schedule
router.get('/', requireAuth, rosterController.getRoster);

// POST /api/roster/generate - Admin auto-generates the conflict-free schedule
router.post('/generate', requireAuth, requireAdmin, rosterController.generateSchedule);

// POST /api/roster/shifts - Admin manually adds a single shift to a date
router.post('/shifts', requireAuth, requireAdmin, rosterController.addShift);

// PUT /api/roster/shifts/:shiftId - Admin edits a specific shift
router.put('/shifts/:shiftId', requireAuth, requireAdmin, rosterController.editShift);

// DELETE /api/roster/shifts/:shiftId - Admin deletes a specific shift
router.delete('/shifts/:shiftId', requireAuth, requireAdmin, rosterController.removeShift);

module.exports = router;