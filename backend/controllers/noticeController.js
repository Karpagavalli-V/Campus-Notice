const Notice = require("../models/Notice");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ================= CREATE NOTICE =================
exports.createNotice = async (req, res) => {
  try {
    const noticeData = {
      ...req.body,
      createdBy: req.user.id
    };

    // If poll is sent as a string (from FormData), parse it
    if (typeof noticeData.poll === 'string') {
      try {
        noticeData.poll = JSON.parse(noticeData.poll);
      } catch (e) {
        console.error("Error parsing poll data:", e);
      }
    }

    // Fix: Set expiryDate to end of the day (23:59:59) so it doesn't expire at start of day
    if (noticeData.expiryDate) {
      const date = new Date(noticeData.expiryDate);
      date.setHours(23, 59, 59, 999);
      noticeData.expiryDate = date;
    }

    if (req.files && req.files.length > 0) {
      noticeData.attachments = req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        fileType: file.mimetype
      }));
    } else if (req.file) {
      // Fallback
      noticeData.attachments = [{
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype
      }];
    }

    const notice = await Notice.create(noticeData);

    // 🏷️ Handle Mentions & Notifications
    const mentionIds = req.body.mentions || [];
    if (mentionIds.length > 0) {
      const mentionNotifications = mentionIds.map(mId => ({
        recipient: mId,
        sender: req.user.id,
        title: "You were tagged!",
        message: `${req.user.name} mentioned you in: "${notice.title}"`,
        noticeId: notice._id,
        type: "mention"
      }));
      await Notification.insertMany(mentionNotifications);
      
      // Emit socket for each mention
      if (req.io) {
        mentionIds.forEach(mId => {
          req.io.to(mId).emit("newNotification", { title: "You were tagged!" });
        });
      }
    }

    // Send generic new notice notifications (only to those NOT mentioned/followed, or just all)
    // For simplicity, notifying all followers of the creator
    const creator = await User.findById(req.user.id);
    const followers = creator.followers || [];

    const notifications = followers.map(fId => ({
      recipient: fId,
      sender: req.user.id,
      title: "New Notice",
      message: `${req.user.name} posted a new notice.`,
      noticeId: notice._id,
      type: notice.priority === 'high' ? 'high_priority' : 'new_notice'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE NOTICE =================
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (notice.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to edit this notice" });
    }

    const updatedData = { ...req.body };
    if (typeof updatedData.poll === 'string') {
      try {
        updatedData.poll = JSON.parse(updatedData.poll);
      } catch (e) {
        console.error("Error parsing poll data:", e);
      }
    }

    if (updatedData.expiryDate) {
      const date = new Date(updatedData.expiryDate);
      date.setHours(23, 59, 59, 999);
      updatedData.expiryDate = date;
    }

    if (req.files && req.files.length > 0) {
      updatedData.attachments = req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        fileType: file.mimetype
      }));
    } else if (req.file) {
      updatedData.attachments = [{
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype
      }];
    }

    const updatedNotice = await Notice.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ACTIVE NOTICES =================
// For Student / Faculty / Admin dashboards
exports.getNotices = async (req, res) => {
  try {
    const { search, department, priority, category } = req.query;
    let query = {
      isActive: true
    };

    // If NOT searching, only show non-expired notices
    if (!search) {
      query.expiryDate = { $gt: new Date() };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "All") {
      query.department = department;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }

    if (req.query.following === 'true') {
      const user = await User.findById(req.user.id);
      if (user && user.following && user.following.length > 0) {
        query.createdBy = { $in: user.following };
      } else {
        // User follows no one, return empty results
        return res.json([]);
      }
    }

    const notices = await Notice.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { text, userName } = req.body;
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const newComment = {
      user: req.user.id,
      userName: userName || "Anonymous",
      text,
    };

    notice.comments.push(newComment);
    
    // 🏷️ Handle Mentions in Comment
    const mentionIds = req.body.mentions || [];
    if (mentionIds.length > 0) {
      const mentionNotifications = mentionIds.map(mId => ({
        recipient: mId,
        sender: req.user.id,
        title: "Mentioned in a Comment",
        message: `${userName || "Someone"} mentioned you in a comment.`,
        noticeId: notice._id,
        type: "mention"
      }));
      await Notification.insertMany(mentionNotifications);
      if (req.io) {
          mentionIds.forEach(mId => req.io.to(mId).emit("newNotification", { title: "Mentioned in comment" }));
      }
    }

    await notice.save();

    // Create notification for the notice creator if they are not the commenter and NOT mentioned
    if (notice.createdBy.toString() !== req.user.id && !mentionIds.includes(notice.createdBy.toString())) {
      await Notification.create({
        recipient: notice.createdBy,
        sender: req.user.id,
        title: "New Comment on Notice",
        message: `${userName || "Someone"} commented on your notice: "${notice.title.substring(0, 20)}..."`,
        noticeId: notice._id,
        type: "comment_reply"
      });
      if (req.io) req.io.to(notice.createdBy.toString()).emit("newNotification", { title: "New Comment on Notice" });
    }

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleLikeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const comment = notice.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.likes) comment.likes = [];
    const index = comment.likes.indexOf(req.user.id);
    let liked = false;

    if (index === -1) {
      comment.likes.push(req.user.id);
      liked = true;
      if (comment.user && comment.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: comment.user,
          sender: req.user.id,
          title: "New Like on Comment",
          message: `Someone liked your comment.`,
          noticeId: notice._id,
          type: "new_notice"
        });
        if (req.io) req.io.to(comment.user.toString()).emit("newNotification", { title: "New Like on Comment" });
      }
    } else {
      comment.likes.splice(index, 1);
      liked = false;
    }

    await notice.save();
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text, userName } = req.body;
    const notice = await Notice.findById(id);

    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const comment = notice.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.replies) comment.replies = [];
    const newReply = {
      user: req.user.id,
      userName: userName || "Anonymous",
      text,
    };

    comment.replies.push(newReply);
    await notice.save();

    if (comment.user && comment.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: comment.user,
        sender: req.user.id,
        title: "New Reply to Comment",
        message: `${userName || "Someone"} replied: "${text.substring(0, 20)}..."`,
        noticeId: notice._id,
        type: "comment_reply"
      });
      if (req.io) req.io.to(comment.user.toString()).emit("newNotification", { title: "New Reply to Comment" });
    }

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleLikeReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const comment = notice.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (!reply.likes) reply.likes = [];
    const index = reply.likes.indexOf(req.user.id);
    let liked = false;

    if (index === -1) {
      reply.likes.push(req.user.id);
      liked = true;
      if (reply.user && reply.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: reply.user,
          sender: req.user.id,
          title: "New Like on Reply",
          message: `Someone liked your reply.`,
          noticeId: notice._id,
          type: "new_notice"
        });
        if (req.io) req.io.to(reply.user.toString()).emit("newNotification", { title: "New Like on Reply" });
      }
    } else {
      reply.likes.splice(index, 1);
      liked = false;
    }

    await notice.save();
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ARCHIVED NOTICES =================
// Role-based: Students see none, Faculty see their own, Admin sees all
exports.getArchivedNotices = async (req, res) => {
  try {
    let query = {
      expiryDate: { $lt: new Date() },
    };

    // Students should not see archived notices
    if (req.user.role === "student") {
      return res.json([]);
    }

    // Faculty only sees their own archived notices
    if (req.user.role === "faculty") {
      query.createdBy = req.user.id;
    }

    // Admin sees all archived notices
    // No additional filter needed for Admin

    const notices = await Notice.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ALL NOTICES =================
// Admin / Faculty (Manage Notices page)
exports.getAllNotices = async (req, res) => {
  try {
    let query = {
      expiryDate: { $gt: new Date() } // Only show non-expired notices
    };
    if (req.user.role === "faculty") {
      query.createdBy = req.user.id;
    }
    const notices = await Notice.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SINGLE NOTICE BY ID =================
// Notice Details page
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("readBy", "name profilePic");

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE NOTICE =================
// Admin / Faculty
exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= READ RECEIPTS =================
exports.markAsRead = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (!notice.readBy.includes(req.user.id)) {
      notice.readBy.push(req.user.id);
      await notice.save();
    }
    res.json({ message: "Marked as read", readCount: notice.readBy.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= POLLS =================
exports.voteInPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const notice = await Notice.findById(req.params.id);

    if (!notice || !notice.poll) {
      return res.status(404).json({ message: "Notice or poll not found" });
    }

    // Remove user's previous votes in this poll
    notice.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== req.user.id);
    });

    // Add new vote
    notice.poll.options[optionIndex].votes.push(req.user.id);
    await notice.save();

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FACULTY STATS =================
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const notices = await Notice.find({ createdBy: userId });

    const totalNotices = notices.length;
    const totalViews = notices.reduce((sum, n) => sum + (n.readBy ? n.readBy.length : 0), 0);
    const totalComments = notices.reduce((sum, n) => sum + (n.comments ? n.comments.length : 0), 0);
    const totalVotes = notices.reduce((sum, n) => {
      if (n.poll && n.poll.options) {
        return sum + n.poll.options.reduce((s, opt) => s + opt.votes.length, 0);
      }
      return sum;
    }, 0);

    const engagementRate = totalViews > 0
      ? (((totalVotes + totalComments) / totalViews) * 100).toFixed(1)
      : 0;

    const priorityWise = [
      { _id: 'high', count: notices.filter(n => n.priority === 'high').length },
      { _id: 'medium', count: notices.filter(n => n.priority === 'medium').length },
      { _id: 'low', count: notices.filter(n => n.priority === 'low').length }
    ];

    const categoryStats = {};
    notices.forEach(n => {
      const cat = n.category || 'General';
      if (!categoryStats[cat]) categoryStats[cat] = 0;
      categoryStats[cat]++;
    });

    const categoryWise = Object.entries(categoryStats).map(([k, v]) => ({ _id: k, count: v }));

    // Find most active category based on count for now
    let mostActiveCategory = "General";
    if (categoryWise.length > 0) {
      mostActiveCategory = categoryWise.reduce((prev, current) => (prev.count > current.count) ? prev : current)._id;
    }

    const recentActivity = notices.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5).map(n => ({
      _id: n._id,
      title: n.title,
      views: n.readBy ? n.readBy.length : 0,
      createdAt: n.createdAt,
      category: n.category
    }));

    res.json({
      totalNotices,
      totalViews,
      totalVotes,
      totalComments,
      engagementRate,
      mostActiveCategory,
      priorityWise,
      categoryWise,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVED NOTICES =================
exports.toggleSaveNotice = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const noticeId = req.params.id;

    const index = user.savedNotices.indexOf(noticeId);
    if (index === -1) {
      user.savedNotices.push(noticeId);
      await user.save();
      res.json({ message: "Notice saved", saved: true });
    } else {
      user.savedNotices.splice(index, 1);
      await user.save();
      res.json({ message: "Notice unsaved", saved: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSavedNotices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedNotices',
      populate: { path: 'createdBy', select: 'name' }
    });

    // Filter out any potential nulls if a saved notice was deleted
    const savedNotices = user.savedNotices.filter(n => n !== null);
    res.json(savedNotices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= LIKES =================
exports.toggleLikeNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    // Initialize likes if it doesn't exist (for older notices)
    if (!notice.likes) notice.likes = [];

    const index = notice.likes.indexOf(req.user.id);
    let liked = false;

    if (index === -1) {
      notice.likes.push(req.user.id);
      liked = true;

      // Notify the creator
      if (notice.createdBy.toString() !== req.user.id) {
        await Notification.create({
          recipient: notice.createdBy,
          sender: req.user.id,
          title: "New Like",
          message: `Someone liked your notice: "${notice.title.substring(0, 20)}..."`,
          noticeId: notice._id,
          type: "new_notice" // Reusing appropriate type
        });
      }
    } else {
      notice.likes.splice(index, 1);
      liked = false;
    }

    await notice.save();
    res.json({ message: liked ? "Notice liked" : "Notice unliked", liked, likeCount: notice.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= NEW REACTIONS =================
exports.toggleReaction = async (req, res) => {
  try {
    const { reactionType } = req.body; // e.g., 'like', 'love', 'insightful', 'clap', 'zap'
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (!notice.reactions) notice.reactions = [];

    const existingIndex = notice.reactions.findIndex(r => r.user.toString() === req.user.id);
    let updatedReaction = null;

    if (existingIndex !== -1) {
      if (notice.reactions[existingIndex].type === reactionType) {
        // Same reaction, remove it (toggle off)
        notice.reactions.splice(existingIndex, 1);
      } else {
        // Changed reaction
        notice.reactions[existingIndex].type = reactionType;
        updatedReaction = reactionType;
      }
    } else {
      // New reaction
      notice.reactions.push({ user: req.user.id, type: reactionType });
      updatedReaction = reactionType;
      
      // Notify creator
      if (notice.createdBy.toString() !== req.user.id) {
          await Notification.create({
            recipient: notice.createdBy,
            sender: req.user.id,
            title: "New Reaction",
            message: `Someone reacted with ${reactionType} to your notice.`,
            noticeId: notice._id,
            type: "reaction"
          });
      }
    }

    await notice.save();
    res.json({ reactions: notice.reactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleCommentReaction = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { reactionType } = req.body;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const comment = notice.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.reactions) comment.reactions = [];

    const existingIndex = comment.reactions.findIndex(r => r.user.toString() === req.user.id);

    if (existingIndex !== -1) {
      if (comment.reactions[existingIndex].type === reactionType) {
        comment.reactions.splice(existingIndex, 1);
      } else {
        comment.reactions[existingIndex].type = reactionType;
      }
    } else {
      comment.reactions.push({ user: req.user.id, type: reactionType });
    }

    await notice.save();
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
