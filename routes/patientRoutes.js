const express = require("express");
const router = express.Router();
const {
  getPatients,
  getPatientByMrn,
  updatePatient,
  updateStatus,
  createPatient, // Ensure this is imported from your controller
} = require("../controllers/patientController");
const {
  requireAuth,
  requireAdmin,
  requireDoctor,
} = require("../middleware/auth");

router.use(requireAuth);

// Only Admins can create a new patient record
router.post("/", requireAdmin, createPatient);

router.get("/", getPatients);
router.get("/:mrn", getPatientByMrn);
router.put("/:mrn", updatePatient);
router.patch("/:mrn/status", requireDoctor, updateStatus);
module.exports = router;
