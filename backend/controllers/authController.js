const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ─── Email transporter ────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, year, rollNumber } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      // Student-specific fields (ignored for admin/faculty if not provided)
      department: department || "",
      year: year || "",
      rollNumber: rollNumber || "",
    });

    if (role === 'student' && department) {
      const Group = require("../models/Group");
      const community = await Group.findOne({
        name: new RegExp(`^${department}$`, 'i'),
        isCommunity: true
      });

      if (community) {
        community.members.push(newUser._id);
        await community.save();
      }
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isLocked) {
      return res.status(403).json({ message: "This account has been locked. Please contact the administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      id: user._id,
      role: user.role,
      name: user.name,
      profilePic: user.profilePic || "",
      department: user.department || "",
      year: user.year || "",
      rollNumber: user.rollNumber || "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, department, year, rollNumber } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;

    // New Profile Enhancement Fields
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.officeHours !== undefined) user.officeHours = req.body.officeHours;
    if (req.body.specialization !== undefined) user.specialization = req.body.specialization;
    if (req.body.socialLinks) {
      try {
        const socials = typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks;
        user.socialLinks = { ...user.socialLinks, ...socials };
      } catch (e) {
        console.error("Failed to parse socialLinks JSON", e);
      }
    }

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || "",
        department: user.department || "",
        year: user.year || "",
        rollNumber: user.rollNumber || "",
        bio: user.bio || "",
        officeHours: user.officeHours || "",
        specialization: user.specialization || "",
        socialLinks: user.socialLinks || {},
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FORGOT PASSWORD — sends real email =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return res.json({ message: "If an account exists with this email, a reset link has been sent." });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Reset link pointing to frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Campus Notice" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔑 Reset Your Campus Notice Password",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #7c3aed, #06b6d4); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
              📢 Campus Notice
            </h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Password Reset Request</p>
          </div>
          <div style="padding: 36px 32px;">
            <p style="color: #1e293b; font-size: 16px; margin: 0 0 12px;">Hi <strong>${user.name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">
              We received a request to reset your Campus Notice password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
            </p>
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">
                Reset My Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              If you didn't request this, you can safely ignore this email. Your password won't change.<br/>
              For security, this link will expire in 15 minutes.
            </p>
          </div>
        </div>
      `,
    });

    res.json({ message: "If an account exists with this email, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send reset email. Please try again." });
  }
};

// ================= RESET PASSWORD (from email link) =================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FOLLOW/UNFOLLOW =================
exports.toggleFollow = async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user.id;

    if (userToFollowId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userToFollowId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Initialize if needed
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    const index = currentUser.following.indexOf(userToFollowId);
    let isFollowing = false;

    if (index === -1) {
      // Follow
      currentUser.following.push(userToFollowId);
      targetUser.followers.push(currentUserId);
      isFollowing = true;
    } else {
      // Unfollow
      currentUser.following.splice(index, 1);
      const followerIndex = targetUser.followers.indexOf(currentUserId);
      if (followerIndex !== -1) targetUser.followers.splice(followerIndex, 1);
      isFollowing = false;
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: isFollowing ? "Successfully followed" : "Successfully unfollowed", isFollowing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("following", "name role profilePic department")
      .populate("followers", "name role profilePic department");

    // Connections = both following and followers
    res.json({
      following: user.following,
      followers: user.followers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("following", "name role profilePic department");
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("followers", "name profilePic department")
      .populate("following", "name profilePic department");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get recent notices by this user
    const Notice = require("../models/Notice");
    const recentNotices = await Notice.find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      ...user._doc,
      recentNotices
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();
    res.json({ message: "Status updated successfully", status: user.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("status");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ status: user.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("name role profilePic department status");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
