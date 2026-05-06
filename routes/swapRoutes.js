const express = require("express");
const router = express.Router();
const swapController = require("../controllers/swapController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, swapController.getSwapRequests);
router.post("/", requireAuth, swapController.createSwapRequest);
router.put(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  swapController.approveSwap,
);
router.put("/:id/reject", requireAuth, requireAdmin, swapController.rejectSwap);
router.delete(
  "/",
  requireAuth,
  requireAdmin,
  swapController.clearAllSwapRequests,
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  swapController.deleteSwapRequest,
);

module.exports = router;
