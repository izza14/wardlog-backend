const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "task_completed",
        "task_assigned",
        "lab_order",
        "patient_update",
        "patient_discharged",
        "document_update",
        "notice",
        "roster",
        "swap_request",
        "patient_assigned",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },

    // Optional references for navigation
    relatedPatient: { type: String }, // MRN
    relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    relatedNote: { type: mongoose.Schema.Types.ObjectId, ref: "ClinicalNote" },
  },
  { timestamps: true },
);

// Good for getUnreadCount (filters by both recipient and read status)
notificationSchema.index({ recipient: 1, read: 1 });

// CRITICAL for getNotifications (filters by recipient, sorts by time)
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
