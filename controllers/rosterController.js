const Roster = require("../models/Roster");
const Staff = require("../models/Staff");

// POST /api/roster/generate (Admin auto-generate schedule)[cite: 1]
exports.generateSchedule = async (req, res, next) => {
  try {
    const { startDate, days } = req.body;
    const numDays = parseInt(days) || 5;

    // Get all staff — don't filter by status in case defaults weren't applied
    let staffList = await Staff.find({ status: "Active" });
    if (staffList.length === 0) {
      staffList = await Staff.find();
    }
    if (staffList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No staff found to schedule!",
      });
    }

    // Only schedule Doctors and Nurses — not Admins
    const doctors = staffList.filter((s) => s.role === "Doctor");
    const nurses = staffList.filter((s) => s.role === "Nurse");

    if (nurses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No nurses found to schedule!",
      });
    }

    let nurseIdx = 0;
    let prevNightNurse = "";
    let created = 0;

    for (let d = 0; d < numDays; d++) {
      const rosterDate = new Date(startDate);
      rosterDate.setDate(rosterDate.getDate() + d);
      rosterDate.setHours(0, 0, 0, 0);

      // Skip if roster already exists — use date string comparison to avoid timezone issues
      const dateStr = rosterDate.toISOString().split("T")[0];
      const dayStart = new Date(dateStr + "T00:00:00.000Z");
      const dayEnd = new Date(dateStr + "T23:59:59.999Z");
      const existing = await Roster.findOne({
        date: { $gte: dayStart, $lte: dayEnd },
      });
      if (existing) continue;

      const shifts = [];

      // ── Doctors ──────────────────────────────────────────────
      if (doctors.length > 0) {
        // Doctor 1 → always Morning (rotate which doctor gets Morning)
        const morningDoc = doctors[d % doctors.length];
        shifts.push({
          shift: "Morning",
          staffName: morningDoc.name,
          role: morningDoc.role,
          ward: morningDoc.department?.startsWith("Ward")
            ? morningDoc.department
            : "Ward A",
        });

        // Doctor 2+ → distribute across Evening and Night
        for (let i = 1; i < doctors.length; i++) {
          const doc = doctors[(d + i) % doctors.length];
          const shift = i % 2 === 1 ? "Evening" : "Night";
          shifts.push({
            shift: shift,
            staffName: doc.name,
            role: doc.role,
            ward: doc.department?.startsWith("Ward")
              ? doc.department
              : "Ward A",
          });
        }
      }

      // ── Nurses (round-robin with conflict prevention) ───────
      // Morning nurse
      let morningNurse = nurses[nurseIdx % nurses.length];
      nurseIdx++;

      // Skip if this nurse had night yesterday
      if (morningNurse.name === prevNightNurse) {
        morningNurse = nurses[nurseIdx % nurses.length];
        nurseIdx++;
      }

      shifts.push({
        shift: "Morning",
        staffName: morningNurse.name,
        role: morningNurse.role,
        ward: morningNurse.department?.startsWith("Ward")
          ? morningNurse.department
          : "Ward A",
      });

      // Evening nurse — make sure it's not the same as morning nurse
      let eveningNurse = nurses[nurseIdx % nurses.length];
      if (eveningNurse.name === morningNurse.name) {
        nurseIdx++;
        eveningNurse = nurses[nurseIdx % nurses.length];
      }
      nurseIdx++;

      shifts.push({
        shift: "Evening",
        staffName: eveningNurse.name,
        role: eveningNurse.role,
        ward: eveningNurse.department?.startsWith("Ward")
          ? eveningNurse.department
          : "Ward A",
      });

      // Night nurse — make sure it's not the same as morning or evening
      let nightNurse = nurses[nurseIdx % nurses.length];
      while (
        nightNurse.name === morningNurse.name ||
        nightNurse.name === eveningNurse.name
      ) {
        nurseIdx++;
        nightNurse = nurses[nurseIdx % nurses.length];
      }
      nurseIdx++;

      shifts.push({
        shift: "Night",
        staffName: nightNurse.name,
        role: nightNurse.role,
        ward: nightNurse.department?.startsWith("Ward")
          ? nightNurse.department
          : "Ward A",
      });

      // Track for next day's conflict check
      prevNightNurse = nightNurse.name;

      await Roster.create({ date: rosterDate, shifts });
      created++;
    }

    const allRosters = await Roster.find().sort({ date: 1 });

    res.status(201).json({
      success: true,
      data: allRosters,
      message:
        created > 0
          ? `Generated ${created} new day(s) of conflict-free schedules`
          : "Roster already exists for all selected dates",
    });
  } catch (error) {
    next(error);
  }
};
// GET /api/roster
exports.getRoster = async (req, res, next) => {
  try {
    // Optionally filter by date range if provided in query params
    const rosters = await Roster.find().sort({ date: 1 });
    res
      .status(200)
      .json({ success: true, data: rosters, message: "Roster retrieved" });
  } catch (error) {
    next(error);
  }
};

// POST /api/roster/shifts (Admin only)
exports.addShift = async (req, res, next) => {
  try {
    const { date, shiftData } = req.body;

    // Find existing roster for the date, or create a new one
    let roster = await Roster.findOne({ date });
    if (!roster) {
      roster = new Roster({ date, shifts: [] });
    }

    roster.shifts.push(shiftData);
    await roster.save();

    res.status(201).json({
      success: true,
      data: roster,
      message: "Shift added successfully",
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// PUT /api/roster/shifts/:shiftId (Admin only)
exports.editShift = async (req, res, next) => {
  try {
    // Finds the specific roster containing the shift, and updates that specific shift in the array
    const roster = await Roster.findOneAndUpdate(
      { "shifts._id": req.params.shiftId },
      { $set: { "shifts.$": { ...req.body, _id: req.params.shiftId } } },
      { returnDocument: "after" },
    );

    if (!roster)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Shift not found" });

    res.status(200).json({
      success: true,
      data: roster,
      message: "Shift updated successfully",
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// DELETE /api/roster/shifts/:shiftId (Admin only)
exports.removeShift = async (req, res, next) => {
  try {
    // Pulls the specific shift out of the shifts array
    const roster = await Roster.findOneAndUpdate(
      { "shifts._id": req.params.shiftId },
      { $pull: { shifts: { _id: req.params.shiftId } } },
      { returnDocument: "after" },
    );

    if (!roster)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Shift not found" });

    res.status(200).json({
      success: true,
      data: null,
      message: "Shift removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
