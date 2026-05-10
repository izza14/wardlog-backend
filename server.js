const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://wardlog-frontend.vercel.app", // Update with your actual Vercel URL
    ],
    credentials: true,
  }),
);
app.use(express.json());

// MongoDB Connection
// Dynamically switch to the test database if running Jest tests
const dbURI =
  process.env.NODE_ENV === "test"
    ? process.env.MONGO_TEST_URI
    : process.env.MONGO_URI;

mongoose
  .connect(dbURI)
  .then(() =>
    console.log(
      process.env.NODE_ENV === "test"
        ? "MongoDB Connected (TEST DB)"
        : "MongoDB Connected",
    ),
  )
  .catch((err) => console.error("MongoDB connection error:", err));

// =========================================================
// ROUTES (Auth + Clinical Documentation Module)
// =========================================================

// Import Routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const clinicalRoutes = require("./routes/clinicalRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/clinical", clinicalRoutes);
app.use("/api/notifications", notificationRoutes);

// =========================================================
// (Ward Coordination Module)
// =========================================================
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/roster", require("./routes/rosterRoutes"));
app.use("/api/swap-requests", require("./routes/swapRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/ward", require("./routes/wardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.message || "Server Error",
  });
});

// Server Listening - Only listen if NOT running tests!
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app so Jest/Supertest can use it
module.exports = app;
