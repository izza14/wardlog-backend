const mongoose = require("mongoose");

const eRoundSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "Daily Progress - MM/DD/YYYY"
    patient: { type: String, required: true },
    patientMrn: { type: String, required: true },
    doctor: { type: String, required: true },
    date: { type: String, required: true }, // MM/DD/YYYY from modal[cite: 6]

    // Vital signs mapping[cite: 6, 9]
    vitals: {
      temperature: String,
      bp: String,
      heartRate: String,
      respRate: String,
      o2Sat: String,
    },

    assessment: { type: String, required: true },
    plan: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ERound", eRoundSchema);
