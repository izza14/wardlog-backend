const ClinicalNote = require("../models/ClinicalNote");
const LabOrder = require("../models/LabOrder");
const ERound = require("../models/ERound");

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
