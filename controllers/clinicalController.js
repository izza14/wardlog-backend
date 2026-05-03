const ClinicalNote = require("../models/ClinicalNote");
const LabOrder = require("../models/LabOrder");
const ERound = require("../models/ERound");
const { createNotification } = require("./notificationController");
const Patient = require("../models/Patient");

// ── CLINICAL NOTES ──
exports.getNotes = async (req, res) => {
  try {
    const query = {};
    if (req.query.patientMrn) {
      query.patientMrn = req.query.patientMrn;
    }
    const notes = await ClinicalNote.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const note = await ClinicalNote.create(req.body);
    // Notify assigned staff about new clinical note
    if (note.patientMrn) {
      const patient = await Patient.findOne({ mrn: note.patientMrn }).populate(
        "assignedDoctor assignedNurse",
        "_id",
      );

      if (patient) {
        const recipients = [
          patient.assignedDoctor?._id,
          patient.assignedNurse?._id,
        ]
          .filter(Boolean)
          .filter((id) => id.toString() !== req.user._id.toString());

        for (const recipientId of recipients) {
          await createNotification({
            recipientId,
            type: "document_update",
            title: "New Clinical Note",
            message: `${note.title} created for ${note.patientName || note.patientMrn}`,
            relatedPatient: note.patientMrn,
            relatedNote: note._id,
          });
          console.log(
            `Notification sent to user ${recipientId} about new note ${note._id} for patient ${note.patientMrn}`,
          );
        }
      }
    }
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── LAB ORDERS ──
exports.getLabOrders = async (req, res) => {
  try {
    const query = {};
    if (req.query.patientMrn) {
      query.patientMrn = req.query.patientMrn;
    }
    const orders = await LabOrder.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLabOrder = async (req, res) => {
  try {
    const order = await LabOrder.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── E-ROUNDS ──
exports.getERounds = async (req, res) => {
  try {
    const query = {};
    if (req.query.patientMrn) {
      query.patientMrn = req.query.patientMrn;
    }
    const rounds = await ERound.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: rounds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createERound = async (req, res) => {
  try {
    const round = await ERound.create(req.body);
    res.status(201).json({ success: true, data: round });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
