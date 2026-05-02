const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    specialty: { type: String },
    department: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },

    // NEW: Allows Admins to assign a Nurse to a Doctor to create a "Team"
    supervisingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Staff", staffSchema);
