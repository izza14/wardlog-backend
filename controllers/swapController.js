const SwapRequest = require("../models/SwapRequest");
const Roster = require("../models/Roster");
const { createNotification } = require("./NotificationController");
const User = require("../models/User");
// POST /api/swap-requests (Staff submit requests)
exports.createSwapRequest = async (req, res, next) => {
  try {
    const { shift, swapWith, requestedDate, reason } = req.body;
    const newRequest = await SwapRequest.create({
      requester: req.user.id,
      shift,
      swapWith,
      requestedDate,
      reason,
    });

    // ── Notify all admins about the new swap request ──
    const requesterUser = await User.findById(req.user.id).select("name");
    const admins = await User.find({ role: "admin" }).select("_id");

    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id,
        type: "swap_request",
        title: "New Swap Request",
        message: `${requesterUser?.name || "A staff member"} has submitted a new shift swap request and is awaiting your approval.`,
      });
    }

    res.status(201).json({
      success: true,
      data: newRequest,
      message: "Swap request submitted",
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// PUT /api/swap-requests/:id/approve (Admin only)
exports.approveSwap = async (req, res, next) => {
  try {
    // Populate so we have the names and _ids of both staff members
    const request = await SwapRequest.findById(req.params.id)
      .populate("requester", "name _id")
      .populate("swapWith", "name _id");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // ── 1. Update the Actual Roster Schedule ─────────────────────────────
    // Create start and end of the requested day to query the Roster
    const rosterStart = new Date(request.requestedDate);
    rosterStart.setHours(0, 0, 0, 0);
    const rosterEnd = new Date(rosterStart.getTime() + 86400000);

    const roster = await Roster.findOne({
      date: { $gte: rosterStart, $lt: rosterEnd },
      "shifts.staffName": request.requester.name,
    });

    if (roster) {
      // Swap the names in the shifts array
      roster.shifts = roster.shifts.map((s) => {
        if (s.staffName === request.requester.name) {
          return { ...s, staffName: request.swapWith.name };
        }
        if (s.staffName === request.swapWith.name) {
          return { ...s, staffName: request.requester.name };
        }
        return s;
      });
      await roster.save();
    }
    // ───────────────────────────────────────────────────────────────────────

    // ── 2. Mark request as Approved ──
    request.status = "approved";
    await request.save();
    const swapWithUser = await User.findOne({ name: request.swapWith.name });

    // ── 3. Send Notification to Requester ──
    if (request.requester && request.requester._id) {
      await createNotification({
        recipientId: request.requester._id,
        type: "swap_request",
        title: "Swap Request Approved",
        message: `Your shift swap request with ${request.swapWith?.name || "a colleague"} has been approved by admin.`,
      });
    }

    // ── 4. Send Notification to SwapWith person ──
    if (swapWithUser && swapWithUser._id) {
      await createNotification({
        recipientId: swapWithUser._id,
        type: "swap_request",
        title: "Shift Swap Approved",
        message: `Admin has approved your shift swap. ${request.requester?.name || "A colleague"} is covering your shift.`,
      });
    }

    res.status(200).json({
      success: true,
      data: request,
      message: "Shift swap approved and roster updated",
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/swap-requests/:id/reject (Admin only)
exports.rejectSwap = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate("requester", "name _id")
      .populate("swapWith", "name _id");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    // 🔔 Send Notification to Requester
    if (request.requester && request.requester._id) {
      await createNotification({
        recipientId: request.requester._id,
        type: "swap_request",
        title: "Swap Request Rejected",
        message: `Your shift swap request with ${request.swapWith?.name || "a colleague"} was declined by admin.`,
      });
    }
    const swapWithUser = await User.findOne({ name: request.swapWith.name });

    // 🔔 Send Notification to SwapWith person
    if (swapWithUser && swapWithUser._id) {
      console.log("SwapWith user:", swapWithUser); // Debugging line to check swapWith data
      await createNotification({
        recipientId: request.swapWith._id,
        type: "swap_request",
        title: "Shift Swap Rejected",
        message: `The proposed shift swap with ${request.requester?.name || "a colleague"} was declined by admin.`,
      });
    }

    res
      .status(200)
      .json({ success: true, data: request, message: "Shift swap rejected" });
  } catch (error) {
    next(error);
  }
};

// GET /api/swap-requests
exports.getSwapRequests = async (req, res, next) => {
  try {
    // Only return un-archived requests
    const requests = await SwapRequest.find({ archived: { $ne: true } })
      .populate("requester", "name role")
      .populate("swapWith", "name role")
      .sort({ requestedDate: 1 });

    res.status(200).json({
      success: true,
      data: requests,
      message: "Swap requests retrieved",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/swap-requests/:id (SOFT DELETE - Admin only)
exports.deleteSwapRequest = async (req, res, next) => {
  try {
    // Update the archived flag instead of actually deleting the document
    const request = await SwapRequest.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { returnDocument: "after" },
    );

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: "Swap request archived and hidden from UI",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/swap-requests (SOFT DELETE ALL - Admin only)
exports.clearAllSwapRequests = async (req, res, next) => {
  try {
    // Mark all current un-archived requests as archived
    await SwapRequest.updateMany(
      { archived: { $ne: true } },
      { $set: { archived: true } },
    );

    res.status(200).json({
      success: true,
      message: "All swap requests archived successfully",
    });
  } catch (error) {
    next(error);
  }
};
