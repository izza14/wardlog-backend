const Patient = require("../models/Patient");
const { createNotification } = require("./notificationController");

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
    res.status(200).json({ success: true, data: patients || [] });
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
    // Get the patient BEFORE update to compare nurse assignment
    const oldPatient = await Patient.findOne({ mrn: req.params.mrn });

    if (!oldPatient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const patient = await Patient.findOneAndUpdate(
      { mrn: req.params.mrn },
      req.body,
      { returnDocument: "after", runValidators: true },
    );

    const patientName = `${patient.firstName} ${patient.lastName}`;
    // Check if nurse assignment changed
    const oldNurseId = oldPatient.assignedNurse?.toString();
    const newNurseId = req.body.assignedNurse?.toString();

    if (newNurseId && newNurseId !== oldNurseId) {
      // Notify the newly assigned nurse
      await createNotification({
        recipientId: newNurseId,
        type: "patient_assigned",
        title: "Patient Assigned to You",
        message: `${patientName} (${patient.mrn}) has been assigned to you by ${req.user.name}`,
        relatedPatient: patient.mrn,
      });
      if (oldNurseId) {
        await createNotification({
          recipientId: oldNurseId,
          type: "patient_update",
          title: "Patient Reassigned",
          message: `${patientName} (${patient.mrn}) has been reassigned to another nurse`,
          relatedPatient: patient.mrn,
        });
      }
    }
    // Check if doctor assignment changed (admin reassigning)
    const oldDocId = oldPatient.assignedDoctor?.toString();
    const newDocId = req.body.assignedDoctor?.toString();

    if (newDocId && newDocId !== oldDocId) {
      await createNotification({
        recipientId: newDocId,
        type: "patient_assigned",
        title: "Patient Assigned to You",
        message: `${patientName} (${patient.mrn}) has been assigned to you`,
        relatedPatient: patient.mrn,
      });

      if (oldDocId) {
        await createNotification({
          recipientId: oldDocId,
          type: "patient_update",
          title: "Patient Reassigned",
          message: `${patientName} (${patient.mrn}) has been reassigned to another doctor`,
          relatedPatient: patient.mrn,
        });
      }
    }

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

    // Notify assigned doctor and nurse
    const patientName = `${patient.firstName} ${patient.lastName}`;

    if (patient.assignedDoctor) {
      await createNotification({
        recipientId: patient.assignedDoctor,
        type: "patient_assigned",
        title: "New Patient Assigned",
        message: `${patientName} (${patient.mrn}) has been assigned to you by Admin`,
        relatedPatient: patient.mrn,
      });
    }

    if (patient.assignedNurse) {
      await createNotification({
        recipientId: patient.assignedNurse,
        type: "patient_assigned",
        title: "New Patient Assigned",
        message: `${patientName} (${patient.mrn}) has been assigned to you by Admin`,
        relatedPatient: patient.mrn,
      });
    }

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

    // ── Notify assigned staff about status change ──
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const recipients = [patient.assignedDoctor?._id, patient.assignedNurse?._id]
      .filter(Boolean)
      .filter((id) => id.toString() !== req.user._id.toString()); // Don't notify yourself

    for (const recipientId of recipients) {
      await createNotification({
        recipientId,
        type: status === "discharged" ? "patient_update" : "patient_update",
        title:
          status === "discharged"
            ? "Patient Discharged"
            : "Patient Status Updated",
        message: `${patientName} (${patient.mrn}) status changed to ${status}`,
        relatedPatient: patient.mrn,
      });
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
