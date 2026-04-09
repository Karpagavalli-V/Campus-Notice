const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "faculty", "student"],
      required: true,
    },

    // Student-specific details
    department: {
      type: String,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },

    rollNumber: {
      type: String,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },

    savedNotices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notice",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Password reset
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    // Gamification
    xp: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    // Profile Enhancements
    bio: {
      type: String,
      default: "",
    },
    officeHours: {
      type: String,
      default: "", // e.g. "Mon-Fri, 10:00 AM - 12:00 PM"
    },
    specialization: {
      type: String,
      default: "", // For Faculty
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Hey there! I am using Campus Notice.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
