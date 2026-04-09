const User = require("../models/User");
const bcrypt = require("bcryptjs");
const csv = require("csvtojson");

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

exports.bulkCreateUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file" });
    }

    const jsonArray = await csv().fromFile(req.file.path);
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const defaultPassword = "CampusPassword123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (const userData of jsonArray) {
      try {
        // validation
        if (!userData.email || !userData.name || !userData.role) {
          throw new Error(`Missing required fields for ${userData.email || 'unknown'}`);
        }

        const email = userData.email.toLowerCase().trim();
        const exists = await User.findOne({ email });

        if (exists) {
          throw new Error(`User with email ${email} already exists`);
        }

        await User.create({
          name: userData.name,
          email,
          role: userData.role,
          department: userData.department || "",
          year: userData.year || "",
          rollNumber: userData.rollNumber || "",
          password: hashedPassword
        });
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(err.message);
      }
    }

    res.json({
      message: `Bulk creation complete. Success: ${results.success}, Failed: ${results.failed}`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleAccountLock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isLocked = !user.isLocked;
    await user.save();

    res.json({ message: `User account ${user.isLocked ? 'locked' : 'unlocked'} successfully`, isLocked: user.isLocked });
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
