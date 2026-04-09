const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Send a message (with optional media)
router.post("/", protect, upload.single("media"), messageController.sendMessage);

// Get all conversations for current user
router.get("/conversations", protect, messageController.getConversations);

// Get specific conversation with a user
router.get("/:userId", protect, messageController.getConversation);

// Edit a message
router.put("/:messageId", protect, messageController.editMessage);

// Delete a message
router.delete("/:messageId", protect, messageController.deleteMessage);

module.exports = router;
