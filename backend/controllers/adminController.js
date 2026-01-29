const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "admin") {
      return res.status(403).json({ message: "Cannot create admin" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const Notice = require("../models/Notice");

// Get admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNotices = await Notice.countDocuments();

    res.json({
      totalUsers,
      totalNotices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users except admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed analytics
exports.getAnalytics = async (req, res) => {
  try {
    const deptWise = await Notice.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const priorityWise = await Notice.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const recentActivity = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("createdBy", "name");

    res.json({
      deptWise,
      priorityWise,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
