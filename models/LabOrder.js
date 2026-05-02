const mongoose = require("mongoose");

const labOrderSchema = new mongoose.Schema(
  {
    orderType: { type: String, required: true }, // e.g., "Blood Work", "Imaging"
    patient: { type: String, required: true },
    patientMrn: { type: String, required: true },
    doctor: { type: String, required: true },
    date: { type: String, required: true },
    priority: {
      type: String,
      enum: ["routine", "urgent", "stat"],
      default: "routine",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    tests: [{ type: String }], // Array of strings[cite: 10]
    notes: { type: String }, // Additional instructions from modal[cite: 7]
  },
  { timestamps: true },
);

module.exports = mongoose.model("LabOrder", labOrderSchema);
