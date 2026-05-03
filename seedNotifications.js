const mongoose = require("mongoose");
require("dotenv").config();

const Notification = require("./models/Notification");
const User = require("./models/User");

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database.");

    // Clear only notifications — leaves all other data intact
    await Notification.deleteMany();
    console.log("Cleared existing notifications.");

    // Fetch users by email so we get the correct ObjectIds
    const sarah = await User.findOne({ email: "sarah@hospital.com" });
    const michael = await User.findOne({ email: "michael@hospital.com" });
    const emily = await User.findOne({ email: "emily@hospital.com" });
    const jessica = await User.findOne({ email: "jessica@hospital.com" });
    const mbrown = await User.findOne({ email: "mbrown@hospital.com" });
    const james = await User.findOne({ email: "james@hospital.com" });
    const admin = await User.findOne({ email: "admin@wardlog.com" });

    if (!sarah || !michael || !emily || !jessica || !admin) {
      console.error("Required users not found. Run the main seed.js first.");
      process.exit(1);
    }

    const now = new Date();
    const minutesAgo = (m) => new Date(now.getTime() - m * 60000);
    const hoursAgo = (h) => new Date(now.getTime() - h * 3600000);

    const notifications = [
      // ── Dr. Sarah Johnson's notifications ──────────────────
      {
        recipient: sarah._id,
        type: "task_completed",
        title: "Task Completed",
        message:
          "Emily Chen completed 'Administer morning medications' for Ward A",
        read: false,
        createdAt: minutesAgo(5),
      },
      {
        recipient: sarah._id,
        type: "lab_order",
        title: "Lab Results Ready",
        message:
          "CBC and CMP results for John Doe (MRN001234) are now available",
        relatedPatient: "MRN001234",
        read: false,
        createdAt: minutesAgo(20),
      },
      {
        recipient: sarah._id,
        type: "document_update",
        title: "Clinical Note Updated",
        message: "Progress Note for Mary Smith (MRN001235) has been finalized",
        relatedPatient: "MRN001235",
        read: false,
        createdAt: hoursAgo(1),
      },
      {
        recipient: sarah._id,
        type: "notice",
        title: "New Notice Posted",
        message:
          "System Maintenance scheduled for tonight at 2:00 AM — save all work",
        read: false,
        createdAt: hoursAgo(2),
      },
      {
        recipient: sarah._id,
        type: "patient_assigned",
        title: "New Patient Assigned",
        message:
          "Robert Brown (MRN001236) has been assigned to you for follow-up",
        relatedPatient: "MRN001236",
        read: true,
        createdAt: hoursAgo(5),
      },
      {
        recipient: sarah._id,
        type: "swap_request",
        title: "Swap Request Update",
        message:
          "Emily Chen's shift swap request for Friday has been submitted for your review",
        read: true,
        createdAt: hoursAgo(8),
      },

      // ── Dr. Michael John's notifications ───────────────────
      {
        recipient: michael._id,
        type: "patient_assigned",
        title: "New Patient Assigned",
        message: "Jane Wilson (MRN001237) has been assigned to you by Admin",
        relatedPatient: "MRN001237",
        read: false,
        createdAt: minutesAgo(10),
      },
      {
        recipient: michael._id,
        type: "notice",
        title: "COVID-19 Protocol Update",
        message:
          "Updated COVID-19 screening protocols are now in effect — review required",
        read: false,
        createdAt: hoursAgo(1),
      },
      {
        recipient: michael._id,
        type: "task_assigned",
        title: "New Task Assigned",
        message:
          "Review lab results for Alice Cooper (MRN001238) — Blood Test Review",
        relatedPatient: "MRN001238",
        read: false,
        createdAt: hoursAgo(3),
      },
      {
        recipient: michael._id,
        type: "notice",
        title: "Staff Meeting Reminder",
        message:
          "Monthly staff meeting at 3:00 PM in the main auditorium — attendance mandatory",
        read: true,
        createdAt: hoursAgo(6),
      },

      // ── Emily Chen (Nurse) notifications ───────────────────
      {
        recipient: emily._id,
        type: "task_assigned",
        title: "New Task Assigned",
        message:
          "Administer evening medications to Ward A patients — assigned by Dr. Sarah Johnson",
        read: false,
        createdAt: minutesAgo(15),
      },
      {
        recipient: emily._id,
        type: "patient_assigned",
        title: "Patient Assigned",
        message: "John Doe (MRN001234) has been assigned to your care",
        relatedPatient: "MRN001234",
        read: false,
        createdAt: hoursAgo(2),
      },
      {
        recipient: emily._id,
        type: "notice",
        title: "System Maintenance",
        message:
          "Hospital system maintenance tonight at 2:00 AM — save all work beforehand",
        read: false,
        createdAt: hoursAgo(3),
      },
      {
        recipient: emily._id,
        type: "roster",
        title: "Roster Published",
        message: "Next week's roster has been published — check your shifts",
        read: true,
        createdAt: hoursAgo(12),
      },
      {
        recipient: emily._id,
        type: "swap_request",
        title: "Swap Request Submitted",
        message: "Your shift swap request for Friday Mar 14 has been submitted",
        read: true,
        createdAt: hoursAgo(24),
      },

      // ── Jessica Wilson (Nurse) notifications ───────────────
      {
        recipient: jessica._id,
        type: "patient_assigned",
        title: "Patient Assigned",
        message:
          "Mary Smith (MRN001235) has been assigned to your care by Dr. Sarah Johnson",
        relatedPatient: "MRN001235",
        read: false,
        createdAt: minutesAgo(30),
      },
      {
        recipient: jessica._id,
        type: "task_assigned",
        title: "New Task Assigned",
        message:
          "Administer evening medications to Ward B patients — assigned by Dr. Michael John",
        read: false,
        createdAt: hoursAgo(1),
      },
      {
        recipient: jessica._id,
        type: "notice",
        title: "COVID-19 Protocol Update",
        message:
          "Updated screening protocols in effect — masks mandatory in all patient areas",
        read: true,
        createdAt: hoursAgo(4),
      },

      // ── Michael Brown (Nurse) notifications ────────────────
      ...(mbrown
        ? [
            {
              recipient: mbrown._id,
              type: "patient_assigned",
              title: "Patient Assigned",
              message: "Jane Wilson (MRN001237) has been assigned to your care",
              relatedPatient: "MRN001237",
              read: false,
              createdAt: hoursAgo(1),
            },
            {
              recipient: mbrown._id,
              type: "notice",
              title: "Staff Meeting Reminder",
              message:
                "Monthly staff meeting tomorrow at 3:00 PM — attendance mandatory",
              read: false,
              createdAt: hoursAgo(3),
            },
          ]
        : []),

      // ── James Wilson (Nurse) notifications ─────────────────
      ...(james
        ? [
            {
              recipient: james._id,
              type: "swap_request",
              title: "Swap Request Pending",
              message: "Your shift swap request for Mar 13 is pending approval",
              read: false,
              createdAt: hoursAgo(2),
            },
            {
              recipient: james._id,
              type: "roster",
              title: "Night Shift Reminder",
              message: "You have a night shift scheduled for tonight — Ward B",
              read: false,
              createdAt: hoursAgo(6),
            },
          ]
        : []),

      // ── Admin notifications ────────────────────────────────
      {
        recipient: admin._id,
        type: "swap_request",
        title: "Swap Request Pending",
        message:
          "Emily Chen has requested a shift swap with Jessica Wilson — requires approval",
        read: false,
        createdAt: minutesAgo(45),
      },
      {
        recipient: admin._id,
        type: "swap_request",
        title: "Swap Request Pending",
        message:
          "James Wilson has requested a shift swap with Michael Brown — requires approval",
        read: false,
        createdAt: hoursAgo(1),
      },
      {
        recipient: admin._id,
        type: "patient_update",
        title: "Patient Status Update",
        message: "5 active patients across 3 wards — 3 admitted, 2 outpatient",
        read: false,
        createdAt: hoursAgo(2),
      },
      {
        recipient: admin._id,
        type: "notice",
        title: "Notice Expiring Soon",
        message:
          "COVID-19 Protocol Update notice expires in 3 days — consider renewal",
        read: true,
        createdAt: hoursAgo(12),
      },
    ];

    const result = await Notification.insertMany(notifications);
    console.log(`Seeded ${result.length} notifications:`);
    console.log(`  - Dr. Sarah Johnson: 6 notifications`);
    console.log(`  - Dr. Michael John: 4 notifications`);
    console.log(`  - Emily Chen: 5 notifications`);
    console.log(`  - Jessica Wilson: 3 notifications`);
    console.log(`  - Michael Brown: ${mbrown ? 2 : 0} notifications`);
    console.log(`  - James Wilson: ${james ? 2 : 0} notifications`);
    console.log(`  - Admin: 4 notifications`);
    console.log("\n✅ Notification seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Notification seeding failed:", error);
    process.exit(1);
  }
};

seedNotifications();
