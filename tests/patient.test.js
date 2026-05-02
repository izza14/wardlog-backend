const request = require("supertest");
const app = require("../server");
const Patient = require("../models/Patient");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

let adminToken, doctorToken;

describe("Patient Endpoints", () => {
  beforeAll(async () => {
    // 1. Clear the test database collections before starting
    await User.deleteMany({});
    await Patient.deleteMany({});

    const secret = process.env.JWT_SECRET || "your_secret_key";

    // 2. Create actual users in the TEST database so middleware can find them
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@wardlog.com",
      password: "password123",
      role: "Admin",
    });

    const doctorUser = await User.create({
      name: "Doctor User",
      email: "doctor@wardlog.com",
      password: "password123",
      role: "Doctor",
    });

    // 3. Generate real signed JWT tokens for the headers
    adminToken = `Bearer ${jwt.sign({ id: adminUser._id }, secret, { expiresIn: "1h" })}`;
    doctorToken = `Bearer ${jwt.sign({ id: doctorUser._id }, secret, { expiresIn: "1h" })}`;
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Cleanly close connection
  });

  it("Admin can create a patient", async () => {
    const res = await request(app)
      .post("/api/patients")
      .set("Authorization", adminToken)
      .send({
        mrn: "MRN12345",
        firstName: "John",
        lastName: "Doe",
        dob: "1990-01-01",
        gender: "male",
        phone: "555-0199",
        ward: "Ward A",
        bedNumber: "A-101",
        diagnosis: "Pneumonia",
        status: "admitted",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.mrn).toEqual("MRN12345");
  });

  it("Doctor cannot create a patient", async () => {
    const res = await request(app)
      .post("/api/patients")
      .set("Authorization", doctorToken)
      .send({
        mrn: "MRN999",
        firstName: "Jane",
        lastName: "Doe",
        status: "admitted",
        dob: "1995-05-05",
        gender: "female",
        phone: "555-0202",
        ward: "Ward B",
        bedNumber: "B-202",
        diagnosis: "Observation",
      });

    expect(res.statusCode).toEqual(403); // Forbidden check[cite: 2]
  });

  it("Doctor can discharge an inpatient", async () => {
    // Ensure the patient exists first
    await Patient.create({
      mrn: "MRN-DISCHARGE",
      firstName: "Test",
      lastName: "Patient",
      status: "admitted",
      dob: "1980-10-10",
      gender: "other",
      phone: "555-9999",
      ward: "Ward C",
      bedNumber: "C-303",
      diagnosis: "Recovery",
    });

    const res = await request(app)
      .put("/api/patients/MRN-DISCHARGE/discharge")
      .set("Authorization", doctorToken);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toEqual("Discharged");
  });
});
