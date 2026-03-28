const Group = require("../models/Group");
const User = require("../models/User");

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, isCommunity, members = [] } = req.body;
    
    // Add creator to admins and members list
    const adminId = req.user.id;
    const initialMembers = [...new Set([adminId, ...members])];

    const group = await Group.create({
      name,
      description,
      creator: adminId,
      admins: [adminId],
      members: initialMembers,
      isCommunity: isCommunity || false,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all groups the user is a member of (or all communities to discover)
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { members: req.user.id },
        { isCommunity: true } // Communities are discoverable
      ]
    }).populate("creator", "name").populate("members", "name profilePic");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a member to group
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const group = await Group.findById(id);

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if user is admin or creator
    if (!group.admins.includes(req.user.id) && group.creator.toString() !== req.user.id) {
       // if not admin, maybe student joining a community
       if (!group.isCommunity || req.user.id !== userId) {
          return res.status(403).json({ message: "Not authorized to add members" });
       }
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message to group
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, noticeId } = req.body;
    const group = await Group.findById(id);

    if (!group) return res.status(404).json({ message: "Group not found" });
    
    if (!group.members.includes(req.user.id)) {
        return res.status(403).json({ message: "You are not a member of this group" });
    }

    // Communities: only admins can send notices/messages
    if (group.isCommunity && !group.admins.includes(req.user.id) && group.creator.toString() !== req.user.id) {
        return res.status(403).json({ message: "Only admins can post in communities" });
    }

    const message = {
      sender: req.user.id,
      text,
      noticeId
    };

    group.messages.push(message);
    await group.save();

    res.status(201).json(group.messages[group.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// React to message
exports.reactToMessage = async (req, res) => {
  try {
    const { id, messageId } = req.params;
    const { emoji } = req.body;
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const message = group.messages.id(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Find if user already reacted
    const existingReaction = message.reactions.find(r => r.user.toString() === req.user.id && r.emoji === emoji);
    if (existingReaction) {
        // remove
        message.reactions = message.reactions.filter(r => !(r.user.toString() === req.user.id && r.emoji === emoji));
    } else {
        message.reactions.push({ user: req.user.id, emoji });
    }

    await group.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get group messages
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id)
        .populate("messages.sender", "name profilePic")
        .populate("messages.noticeId", "title category");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
