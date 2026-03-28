const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isCommunity: {
      type: Boolean,
      default: false, // True for Admin-created communities
    },
    joinLink: {
      type: String, // Unique link string for communities
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
        },
        noticeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Notice",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        reactions: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            emoji: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
