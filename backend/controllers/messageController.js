const Message = require("../models/Message");
const User = require("../models/User");

// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content, parentMessageId } = req.body;
        let mediaUrl = null;
        let mediaType = null;

        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            const ext = req.file.mimetype.split('/')[0];
            mediaType = ext === 'image' ? 'image' : (ext === 'video' ? 'video' : 'document');
        }

        let message = await Message.create({
            sender: req.user.id,
            recipient: recipientId,
            content: content || "",
            replyTo: parentMessageId || null,
            mediaUrl,
            mediaType,
        });

        // Populate for real-time update
        message = await Message.findById(message._id).populate("replyTo").populate("sender", "name profilePic");

        // Notify recipient via Socket.io
        req.io.to(recipientId).emit("newMessage", message);

        // Also notify sender (for other devices synchronization)
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
        })
            .populate("replyTo")
            .sort({ createdAt: 1 });

        // Update read status for messages sent to current user
        await Message.updateMany(
            { sender: userId, recipient: currentUserId, read: false },
            { $set: { read: true } }
        );

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

        for (const msg of messages) {
            const otherUser = msg.sender._id.toString() === currentUserId
                ? msg.recipient
                : msg.sender;

            const otherUserId = otherUser._id.toString();

            if (!conversations[otherUserId]) {
                // Get unread count for this user
                const unreadCount = await Message.countDocuments({
                    sender: otherUserId,
                    recipient: currentUserId,
                    read: false
                });

                conversations[otherUserId] = {
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount
                };
            }
        }

        res.json(Object.values(conversations));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================= EDIT MESSAGE =================
exports.editMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Ensure user is the sender
        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to edit this message" });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        // Notify both via socket
        const recipientId = message.recipient.toString();
        const updateData = { messageId, content, isEdited: true };
        req.io.to(recipientId).to(req.user.id).emit("messageEdited", updateData);

        res.json(message);
    } catch (error) {
        next(error);
    }
};

// ================= DELETE MESSAGE =================
exports.deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Ensure user is the sender
        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        const recipientId = message.recipient.toString();
        await Message.findByIdAndDelete(messageId);

        // Notify both via socket
        req.io.to(recipientId).to(req.user.id).emit("messageDeleted", { messageId });

        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        next(error);
    }
};
