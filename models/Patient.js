const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    mrn: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["admitted", "outpatient", "discharged", "completed"], // added "completed"
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    address: { type: String },
    phone: { type: String, required: true },
    email: { type: String },

    // ── Added fields used by the UI ──
    diagnosis: { type: String },
    patientType: {
      type: String,
      enum: ["inpatient", "outpatient"],
      required: true,
    },

    ward: { type: String },
    bedNumber: { type: String },

    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    admissionDate: { type: Date },
    appointmentDate: { type: Date },
  },
  { timestamps: true },
);

patientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Patient", patientSchema);
