// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Import your authentication middleware (adjust path as needed)
const { requireAuth, requireAdmin } = require("../middleware/auth");

/**
 * Route: /api/users
 * GET: Fetch all users (can filter by role via query params: /api/users?role=Doctor)
 * Access: Private (Typically Admin or authorized Staff)
 */
router.route("/").get(requireAuth, getUsers);

/**
 * Route: /api/users/:id
 * GET: Fetch a single user by their MongoDB _id
 * PUT: Update user details (name, email, role, or password)
 * DELETE: Remove a user from the system
 * Access: Private/Admin
 */
router
  .route("/:id")
  .get(requireAuth, getUserById)
  .put(requireAdmin, updateUser)
  .delete(requireAdmin, deleteUser);

module.exports = router;
