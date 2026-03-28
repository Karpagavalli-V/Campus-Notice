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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
