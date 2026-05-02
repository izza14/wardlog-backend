const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, staffController.getAllStaff);
router.post("/", requireAuth, requireAdmin, staffController.addStaff); // Admin only CRUD
router.put("/:id", requireAuth, requireAdmin, staffController.updateStaff);
router.delete("/:id", requireAuth, requireAdmin, staffController.deleteStaff);
router.get("/doctors", requireAuth, staffController.getDoctors);
module.exports = router;
