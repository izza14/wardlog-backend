const Notification = require("../models/Notification");
const User = require("../models/User");

// ── GET /api/notifications — Get current user's notifications ──
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/notifications/unread-count — Quick badge count ──
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/notifications/:id/read — Mark one as read ──
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { returnDocument: "after" },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/notifications/read-all — Mark all as read ──
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true },
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/notifications — Clear all for current user ──
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── HELPER: Create a notification (called from other controllers) ──
// This is not a route handler — import and call it from other controllers
exports.createNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedPatient,
  relatedTask,
  relatedNote,
}) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedPatient,
      relatedTask,
      relatedNote,
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

// ── HELPER: Notify multiple users at once ──
exports.notifyMany = async (
  recipientIds,
  { type, title, message, ...rest },
) => {
  try {
    const docs = recipientIds.map((id) => ({
      recipient: id,
      type,
      title,
      message,
      ...rest,
    }));
    await Notification.insertMany(docs);
  } catch (err) {
    console.error("Failed to create bulk notifications:", err.message);
  }
};
