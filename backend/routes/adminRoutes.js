const express = require("express");
const router = express.Router();

const {
  createUser,
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAnalytics
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create faculty / student
router.post(
  "/create-user",
  protect,
  authorizeRoles("admin"),
  createUser
);

// Admin stats
router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  getAdminStats
);

// ✅ GET ALL USERS (THIS WAS THE COMMONLY MISSING ONE)
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

// ✅ DELETE USER
router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);

router.get(
  "/analytics",
  protect,
  authorizeRoles("admin"),
  getAnalytics
);

module.exports = router;
