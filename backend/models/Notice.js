const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      default: "General",
    },

    category: {
      type: String,
      default: "General",
    },

    subType: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["emergency", "high", "medium", "low"],
      default: "low",
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
      },
    ],

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, default: "like" }, // like, love, clap, zap, etc.
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    poll: {
      question: String,
      options: [
        {
          text: String,
          votes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          ],
        },
      ],
    },

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userName: String,
        text: {
          type: String,
          required: true,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        reactions: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            type: { type: String, default: "like" },
          },
        ],
        mentions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            userName: String,
            text: {
              type: String,
              required: true,
            },
            likes: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
