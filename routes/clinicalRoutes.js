const express = require("express");
const router = express.Router();
const {
  getNotes,
  createNote,
  getLabOrders,
  createLabOrder,
  getERounds,
  createERound,
} = require("../controllers/clinicalController");
const { requireAuth } = require("../middleware/auth");

// All clinical routes are protected
router.use(requireAuth);

router.route("/notes").get(getNotes).post(createNote);
router.route("/lab-orders").get(getLabOrders).post(createLabOrder);
router.route("/e-rounds").get(getERounds).post(createERound);

module.exports = router;
