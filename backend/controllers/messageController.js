const Message = require("../models/Message");
const User = require("../models/User");

// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        const message = await Message.create({
            sender: req.user.id,
            recipient: recipientId,
            content,
        });

        // Notify recipient via Socket.io
        req.io.to(recipientId).emit("newMessage", {
            ...message._doc,
            sender: req.user.id // Send ID or populate if needed
        });

        // Also notify sender (if they have multiple tabs open) - optional but good
        req.io.to(req.user.id).emit("newMessage", message);

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================= GET CONVERSATION =================
exports.getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================= GET RECENT CONVERSATIONS =================
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find all messages where user is sender or recipient
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { recipient: currentUserId }],
        })
            .populate("sender", "name email role profilePic") // adjusted fields
            .populate("recipient", "name email role profilePic") // adjusted fields
            .sort({ createdAt: -1 });

        // Group by other user to get unique conversations
        const conversations = {};

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === currentUserId
                ? msg.recipient
                : msg.sender;

            if (!conversations[otherUser._id]) {
                conversations[otherUser._id] = {
                    user: otherUser,
                    lastMessage: msg
                };
            }
        });

        res.json(Object.values(conversations));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
