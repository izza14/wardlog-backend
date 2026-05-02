const mongoose = require("mongoose");

const clinicalNoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "Progress Note"
    patientName: { type: String, required: true },
    patientMrn: { type: String, required: true },
    doctor: { type: String, required: true },
    date: { type: String, required: true }, // Using string to match frontend .toLocaleString()
    status: { type: String, enum: ["Final", "Draft"], default: "Final" },
    template: {
      type: String,
      enum: ["progress", "admission", "discharge", "procedure"],
    },

    // SOAP specific fields[cite: 4]
    soap: {
      subjective: String,
      objective: String,
      assessment: String,
      plan: String,
    },

    // Generic fields for admission, discharge, and procedure templates[cite: 4, 8]
    fields: [
      {
        label: String,
        value: String,
      },
    ],

    // Version history requirement from backend division[cite: 2]
    versionHistory: [Object],
  },
  { timestamps: true },
);

module.exports = mongoose.model("ClinicalNote", clinicalNoteSchema);
