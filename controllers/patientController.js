const Patient = require("../models/Patient");

// ── Helper Function: Generate MRN ──
// Format: MRN-YYYYMMDD-XXXX (e.g., MRN-20260502-8492)
const generateMRN = async () => {
  let isUnique = false;
  let newMRN = "";

  while (!isUnique) {
    const date = new Date();
    const dateString = date.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number

    newMRN = `MRN-${dateString}-${randomNum}`;

    // Check if it already exists in the database just to be 100% safe
    const existingPatient = await Patient.findOne({ mrn: newMRN });
    if (!existingPatient) {
      isUnique = true;
    }
  }

  return newMRN;
};

// Fetch all patients for Management Table
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("assignedDoctor", "name _id")
      .populate("assignedNurse", "name _id")
      .sort({ admissionDate: -1 });
    res.status(200).json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch specific patient for Detail View
exports.getPatientByMrn = async (req, res) => {
  try {
    const patient = await Patient.findOne({ mrn: req.params.mrn })
      .populate("assignedDoctor", "name _id")
      .populate("assignedNurse", "name _id");

    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    res.status(200).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Patient info (Edit Modal)
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { mrn: req.params.mrn },
      req.body,
      { returnDocument: "after", runValidators: true },
    );
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    res.status(200).json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Create Patient (Admin only)
exports.createPatient = async (req, res) => {
  try {
    const uniqueMrn = await generateMRN();
    const patient = await Patient.create({ ...req.body, mrn: uniqueMrn });
    res
      .status(201)
      .json({ success: true, data: patient, message: "Patient created" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generic status update — handles discharge AND complete (Doctor/Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["admitted", "outpatient", "discharged", "completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`,
      });
    }

    const patient = await Patient.findOneAndUpdate(
      { mrn: req.params.mrn },
      { status },
      { returnDocument: "after", runValidators: true },
    );

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.json({
      success: true,
      data: patient,
      message: `Patient status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
