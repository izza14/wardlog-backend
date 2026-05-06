const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import your models
const Staff = require("./models/Staff");
const Task = require("./models/Task");
const Notice = require("./models/Notice");
const Settings = require("./models/Settings"); // Added for Member 2
const User = require("./models/User");
const Patient = require("./models/Patient");
const ClinicalNote = require("./models/ClinicalNote");
const LabOrder = require("./models/LabOrder");
const ERound = require("./models/ERound");
const Roster = require("./models/Roster");
const SwapRequest = require("./models/SwapRequest");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database. Wiping old data...");

    // Clear all
    await Promise.all([
      User.deleteMany(),
      Patient.deleteMany(),
      ClinicalNote.deleteMany(),
      LabOrder.deleteMany(),
      ERound.deleteMany(),
      Task.deleteMany(),
      Roster.deleteMany(),
      SwapRequest.deleteMany(),
      Staff.deleteMany(),
      Notice.deleteMany(),
      Settings.deleteMany(),
    ]);
    console.log("Cleared all collections");

    // SRS Requirement: Encrypt passwords using bcrypt with cost 10
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash('password123', salt);
    const existing = await User.findOne({ email: "admin@wardlog.com" });
    console.log("Seeding System Settings...");
    await Settings.create({
      hospitalName: "WardLog General Hospital",
      timezone: "PKT",
      sessionTimeout: 15, // Matches SRS security requirement[cite: 2]
      maxPatients: 200,
      backupFrequency: "Daily", // Matches SRS reliability requirement[cite: 2]
    });

    // 3. Seed System Admin (Main account)
    console.log("Seeding Admin User...");
    await User.create({
      name: "System Admin",
      email: "admin@wardlog.com",
      password: "password123", // Hashed by User model hook
      role: "Admin",
    });

    console.log("Seeding Staff Directory...");
    // ── Staff ──
    const staff = await Staff.create([
      {
        name: "Dr. Sarah Johnson",
        role: "Doctor",
        specialty: "Internal Medicine",
        department: "General Medicine",
        phone: "555-0101",
        email: "sarah.johnson@hospital.com",
      },
      {
        name: "Dr. Michael John",
        role: "Doctor",
        specialty: "Internal Medicine",
        department: "General Medicine",
        phone: "555-0102",
        email: "michael.john@hospital.com",
      },
      {
        name: "Emily Chen",
        role: "Nurse",
        department: "Ward A",
        phone: "555-0201",
        email: "emily.chen@hospital.com",
      },
      {
        name: "Jessica Wilson",
        role: "Nurse",
        department: "Ward B",
        phone: "555-0202",
        email: "jessica.wilson@hospital.com",
      },
      {
        name: "Michael Brown",
        role: "Nurse",
        department: "Ward C",
        phone: "555-0203",
        email: "michael.brown@hospital.com",
      },
      {
        name: "James Wilson",
        role: "Nurse",
        department: "Ward B",
        phone: "555-0204",
        email: "james.wilson@hospital.com",
      },
      {
        name: "Robert Davis",
        role: "Admin",
        department: "Administration",
        phone: "555-0301",
        email: "robert.davis@hospital.com",
      },
      {
        name: "Linda Martinez",
        role: "Admin",
        department: "Administration",
        phone: "555-0302",
        email: "linda.martinez@hospital.com",
      },
    ]);
    console.log(`Seeded ${staff.length} staff`);

    // ── Users ──
    const users = await User.create([
      {
        name: "Dr. Sarah Johnson",
        email: "sarah@hospital.com",
        password: "password123",
        role: "Doctor",
      },
      {
        name: "Dr. Michael John",
        email: "michael@hospital.com",
        password: "password123",
        role: "Doctor",
      },
      {
        name: "Emily Chen",
        email: "emily@hospital.com",
        password: "password123",
        role: "Nurse",
      },
      {
        name: "Jessica Wilson",
        email: "jessica@hospital.com",
        password: "password123",
        role: "Nurse",
      },
      {
        name: "Michael Brown",
        email: "mbrown@hospital.com",
        password: "password123",
        role: "Nurse",
      },
      {
        name: "James Wilson",
        email: "james@hospital.com",
        password: "password123",
        role: "Nurse",
      },
      {
        name: "Robert Davis",
        email: "robert@hospital.com",
        password: "password123",
        role: "Admin",
      },
      {
        name: "Linda Martinez",
        email: "linda@hospital.com",
        password: "password123",
        role: "Admin",
      },
    ]);
    console.log(`Seeded ${users.length} users`);

    const doc = users[0]._id;
    const doc2 = users[1]._id;
    const nurse1 = users[2]._id;
    const nurse2 = users[3]._id;
    const nurse3 = users[4]._id;
    const nurse4 = users[5]._id;

    // ── Patients ──
    const patients = await Patient.create([
      {
        mrn: "MRN001234",
        firstName: "John",
        lastName: "Doe",
        dob: "3/15/1985",
        gender: "male",
        phone: "555-1001",
        email: "john.doe@gmail.com",
        address: "123 Main St",
        diagnosis: "Pneumonia",
        patientType: "inpatient",
        status: "admitted",
        ward: "Ward A",
        bedNumber: "A-101",
        assignedDoctor: doc,
        condition: "Monitoring",
        assignedNurse: nurse1,
        admissionDate: "3/10/2026",
      },
      {
        mrn: "MRN001235",
        firstName: "Mary",
        lastName: "Smith",
        dob: "6/20/1990",
        gender: "female",
        phone: "555-1002",
        email: "mary.smith@gmail.com",
        address: "456 Oak Ave",
        diagnosis: "Diabetes Management",
        patientType: "inpatient",
        status: "admitted",
        ward: "Ward A",
        bedNumber: "A-102",
        assignedDoctor: doc,
        assignedNurse: nurse2,
        admissionDate: "3/11/2026",
      },
      {
        mrn: "MRN001236",
        firstName: "Robert",
        lastName: "Brown",
        dob: "7/22/1990",
        gender: "male",
        phone: "555-1003",
        email: "robert.brown@gmail.com",
        address: "789 Pine Rd",
        diagnosis: "Follow-up Checkup",
        patientType: "outpatient",
        status: "outpatient",
        assignedDoctor: doc,
        appointmentDate: "4/28/2026",
      },
      {
        mrn: "MRN001237",
        firstName: "Jane",
        lastName: "Wilson",
        dob: "1/10/1978",
        gender: "female",
        phone: "555-1004",
        email: "jane.wilson@gmail.com",
        address: "321 Elm St",
        diagnosis: "Pneumonia",
        patientType: "inpatient",
        status: "admitted",
        ward: "Ward A",
        bedNumber: "A-103",
        assignedDoctor: doc2,
        assignedNurse: nurse3,
        admissionDate: "3/09/2026",
      },
      {
        mrn: "MRN001238",
        firstName: "Alice",
        lastName: "Cooper",
        dob: "4/05/1995",
        gender: "female",
        phone: "555-1005",
        email: "alice.cooper@gmail.com",
        address: "555 Maple Dr",
        diagnosis: "Blood Test Review",
        patientType: "outpatient",
        status: "outpatient",
        condition: "Monitoring",
        assignedDoctor: doc2,
        assignedNurse: nurse4,
        appointmentDate: "4/29/2026",
      },
      // --- NEW WARD B PATIENTS ---
      {
        mrn: "MRN001239",
        firstName: "William",
        lastName: "Taylor",
        dob: "2/14/1982",
        gender: "male",
        phone: "555-1006",
        email: "wtaylor@gmail.com",
        address: "789 Pine Rd",
        diagnosis: "Asthma Exacerbation",
        patientType: "inpatient",
        status: "admitted",
        ward: "Ward B",
        bedNumber: "B-102", // Fills Bed 2 in Ward B
        assignedDoctor: doc,
        assignedNurse: nurse2,
        admissionDate: "3/14/2026",
      },
      {
        mrn: "MRN001240",
        firstName: "Sarah",
        lastName: "Connor",
        dob: "8/29/1984",
        gender: "female",
        phone: "555-1007",
        email: "sconnor@gmail.com",
        address: "404 Skynet Blvd",
        diagnosis: "Post-Op Recovery",
        patientType: "inpatient",
        status: "admitted",
        ward: "Ward B",
        bedNumber: "B-105", // Fills Bed 5 in Ward B
        assignedDoctor: doc2,
        assignedNurse: nurse3,
        admissionDate: "3/15/2026",
      },
      {
        mrn: "MRN001241",
        firstName: "James",
        lastName: "Miller",
        dob: "11/05/1975",
        gender: "male",
        phone: "555-1008",
        email: "jmiller@gmail.com",
        address: "12 Sunset Dr",
        diagnosis: "Cardiac Monitoring",
        patientType: "inpatient",
        condition: "Critical",
        status: "admitted",
        ward: "Ward B",
        bedNumber: "B-108", // Fills Bed 8 in Ward B
        assignedDoctor: doc,
        assignedNurse: nurse4,
        admissionDate: "3/16/2026",
      },

      // --- NEW WARD C PATIENTS ---
      {
        mrn: "MRN001242",
        firstName: "Emma",
        lastName: "Davis",
        dob: "9/12/1992",
        gender: "female",
        phone: "555-1009",
        email: "edavis@gmail.com",
        address: "88 River View",
        diagnosis: "Appendectomy",
        patientType: "inpatient",
        status: "admitted",
        ward: "Ward C",
        bedNumber: "C-103", // Fills Bed 3 in Ward C
        assignedDoctor: doc2,

        assignedNurse: nurse1,
        admissionDate: "3/15/2026",
      },
      {
        mrn: "MRN001243",
        firstName: "David",
        lastName: "Wilson",
        dob: "1/30/1965",
        gender: "male",
        phone: "555-1010",
        condition: "Monitoring",
        email: "dwilson@gmail.com",
        address: "55 Mountain Path",
        diagnosis: "Pneumonia",
        patientType: "inpatient",
        status: "admitted",
        ward: "Ward C",
        bedNumber: "C-109", // Fills Bed 9 in Ward C
        assignedDoctor: doc,
        assignedNurse: nurse2,
        admissionDate: "3/16/2026",
      },
    ]);
    console.log(`Seeded ${patients.length} patients`);

    // ── Clinical Notes ──
    await ClinicalNote.create([
      {
        patientMrn: "MRN001234",
        patientName: "John Doe",
        doctor: "Dr. Sarah Johnson",
        template: "progress",
        title: "Progress Note",
        status: "Final",
        // In seed.js:
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
        soap: {
          subjective: "Patient reports improved breathing, decreased cough",
          objective: "Temp 98.6°F, BP 120/80, RR 16, O2 sat 96% on room air",
          assessment: "Pneumonia improving on antibiotics",
          plan: "Continue current antibiotic regimen",
        },
      },
    ]);

    // ── Lab Orders ──
    await LabOrder.create([
      {
        patientMrn: "MRN001234",
        patient: "John Doe",
        doctor: "Dr. Sarah Johnson",
        orderType: "Blood Work",
        priority: "routine",
        status: "completed",
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
        tests: ["CBC", "CMP"],
      },
    ]);

    // ── E-Rounds ──
    await ERound.create([
      {
        patientMrn: "MRN001234",
        patient: "John Doe",
        doctor: "Dr. Sarah Johnson",
        date: "3/12/2026",
        title: "Daily Progress - 3/12/2026",
        vitals: {
          temperature: "98.6",
          bp: "120/80",
          heartRate: "72",
          respRate: "16",
          o2Sat: "96",
        },
        assessment: "Stable condition, lungs clearer",
        plan: "Continue current treatment, monitor vitals q4h",
      },
    ]);
    const adminUser = await User.findOne({ role: "Admin" }); // Find the actual admin

    console.log("Seeding Notices...");
    // ── Notices ──
    await Notice.create([
      {
        title: "System Maintenance Scheduled",
        content:
          "The hospital management system will undergo scheduled maintenance on March 15, 2026 from 2:00 AM to 4:00 AM.",
        category: "System",
        priority: "High",
        author: adminUser._id, // Use the actual admin's ID
      },
      {
        title: "New COVID-19 Protocol Update",
        content:
          "Updated COVID-19 screening protocols are now in effect. All staff must review the new guidelines.",
        category: "Policy",
        priority: "High",
        author: adminUser._id, // Use the actual admin's ID
      },
      {
        title: "Staff Meeting - March 12",
        content:
          "Monthly all-hands staff meeting at 3:00 PM in the main auditorium.",
        category: "General",
        priority: "Medium",
        author: adminUser._id, // Use the actual admin's ID
      },
    ]);

    console.log(
      "✅ Seeding Complete! System settings and mock data are ready.",
    );

    // ── Tasks ──
    await Task.create([
      {
        title: "Administer morning medications",
        description:
          "Administer scheduled morning medications to Ward A patients",
        assignedTo: nurse1._id,
        createdBy: doc._id,
        type: "Medication",
        priority: "high",
        status: "completed",
      },
      {
        title: "Review lab results for Patient 1",
        description: "Check CBC and CMP results from morning blood draw",
        assignedTo: doc._id,
        createdBy: doc._id,
        type: "Clinical",
        priority: "high",
        status: "pending",
      },
      {
        title: "Update discharge summary",
        description: "Complete discharge documentation for MRN001236",
        assignedTo: doc._id,
        createdBy: doc._id,
        type: "Administrative",
        priority: "medium",
        status: "in-progress",
      },
      {
        title: "Administer evening medications",
        description:
          "Administer scheduled evening medications to Ward B patients",
        assignedTo: nurse2._id,
        createdBy: doc2._id,
        type: "Medication",
        priority: "medium",
        status: "pending",
      },
    ]);
    // ── Roster ──
    await Roster.create([
      {
        date: "Thursday, March 12, 2026",
        shifts: [
          {
            shift: "Morning",
            staffName: "Emily Chen",
            role: "Nurse",
            ward: "Ward A",
          },
          {
            shift: "Morning",
            staffName: "Jessica Wilson",
            role: "Nurse",
            ward: "Ward B",
          },
          {
            shift: "Evening",
            staffName: "Michael Brown",
            role: "Nurse",
            ward: "Ward C",
          },
          {
            shift: "Night",
            staffName: "James Wilson",
            role: "Nurse",
            ward: "Ward B",
          },
        ],
      },
      {
        date: "Friday, March 13, 2026",
        shifts: [
          {
            shift: "Morning",
            staffName: "Dr. Sarah Johnson",
            role: "Doctor",
            ward: "Ward A",
          },
          {
            shift: "Evening",
            staffName: "Emily Chen",
            role: "Nurse",
            ward: "Ward A",
          },
          {
            shift: "Night",
            staffName: "Jessica Wilson",
            role: "Nurse",
            ward: "Ward B",
          },
        ],
      },
    ]);

    // ── Swap Requests ──

    // 1. Fetch Users to get their IDs
    const emilyDoc = await User.findOne({ name: "Emily Chen" });
    const jessicaDoc = await User.findOne({ name: "Jessica Wilson" });
    const michaelDoc = await User.findOne({ name: "Michael Brown" });
    const jamesDoc = await User.findOne({ name: "James Wilson" });

    const emilyStaff = await Staff.findOne({ name: "Emily Chen" });
    const jessicaStaff = await Staff.findOne({ name: "Jessica Wilson" });
    const michaelStaff = await Staff.findOne({ name: "Michael Brown" });
    const jamesStaff = await Staff.findOne({ name: "James Wilson" });
    // 2. Fetch the Roster/Shift to link the swap (Optional, or use a dummy ID)
    const rosterDoc = await Roster.findOne({
      date: "Thursday, March 12, 2026",
    });

    const emilyShift = rosterDoc.shifts.find(
      (s) => s.staffName === "Emily Chen",
    );
    const jamesShift = rosterDoc.shifts.find(
      (s) => s.staffName === "James Wilson",
    );

    await SwapRequest.create([
      {
        requester: emilyDoc._id,
        requesterRole: "Nurse",
        shift: emilyShift._id,
        swapWith: jessicaStaff._id,
        requestedDate: "3/14/2026",
        reason: "Family emergency",
        status: "pending",
      },
      {
        requester: jamesDoc._id,
        requesterRole: "Nurse",
        shift: jamesShift._id,
        swapWith: michaelStaff._id,
        requestedDate: "3/13/2026",
        reason: "Doctor appointment",
        status: "pending",
      },
    ]);
    console.log("seeding complete");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
};

seedDatabase();
