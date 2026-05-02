const request = require("supertest");
const app = require("../server"); // Assuming Express app is exported from server.js
const User = require("../models/User");
const mongoose = require("mongoose");

describe("Auth Endpoints", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);
    await User.deleteMany();
    await User.create({
      email: "doctor@wardlog.com",
      password: "password123",
      role: "Doctor",
      name: "Dr. Smith",
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should login user and return JWT", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "doctor@wardlog.com",
        password: "password123",
        role: "Doctor",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "doctor@wardlog.com",
        password: "wrongpassword",
        role: "Doctor",
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
