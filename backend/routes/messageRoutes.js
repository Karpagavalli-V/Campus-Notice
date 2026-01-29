const express = require("express");
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Send a message
router.post("/", protect, messageController.sendMessage);

// Get all conversations for current user
router.get("/conversations", protect, messageController.getConversations);

// Get specific conversation with a user
router.get("/:userId", protect, messageController.getConversation);

module.exports = router;
