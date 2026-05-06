const express = require("express");
const router = express.Router();
const {
  getPatients,
  getPatientByMrn,
  updatePatient,
  updateStatus,
  deletePatient,
  createPatient, 
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
router.delete("/:mrn", requireAdmin, deletePatient);
module.exports = router;
