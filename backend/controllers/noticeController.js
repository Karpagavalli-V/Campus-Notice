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

    // Fix: Set expiryDate to end of the day (23:59:59) so it doesn't expire at start of day
    if (noticeData.expiryDate) {
      const date = new Date(noticeData.expiryDate);
      date.setHours(23, 59, 59, 999);
      noticeData.expiryDate = date;
    }

    if (req.file) {
      noticeData.attachments = [{
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype
      }];
    }

    const notice = await Notice.create(noticeData);

    // Send notifications to all users
    const users = await User.find({ _id: { $ne: req.user.id } });

    const notifications = users.map(user => ({
      recipient: user._id,
      sender: req.user.id,
      title: "New Notice Posted",
      message: `${notice.title} has been posted.`,
      noticeId: notice._id,
      type: notice.priority === 'high' ? 'high_priority' : 'new_notice'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ACTIVE NOTICES =================
// For Student / Faculty / Admin dashboards
exports.getNotices = async (req, res) => {
  try {
    const { search, department, priority } = req.query;
    let query = {
      isActive: true,
      expiryDate: { $gt: new Date() } // Only show non-expired notices in the feed
    };

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

    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }

    const notices = await Notice.find(query).sort({
      createdAt: -1,
    });
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
    await notice.save();

    // Create notification for the notice creator if they are not the commenter
    if (notice.createdBy.toString() !== req.user.id) {
      await Notification.create({
        recipient: notice.createdBy,
        sender: req.user.id,
        title: "New Comment on Notice",
        message: `${userName || "Someone"} commented on your notice: "${notice.title.substring(0, 20)}..."`,
        noticeId: notice._id,
        type: "comment_reply"
      });
    }

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ARCHIVED NOTICES =================
// Admin sees all, Faculty sees only theirs, Student sees none
exports.getArchivedNotices = async (req, res) => {
  try {
    let query = {
      expiryDate: { $lt: new Date() },
    };

    if (req.user.role === "faculty") {
      query.createdBy = req.user.id;
    } else if (req.user.role === "student") {
      return res.json([]); // Students see no archives as per request
    }

    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ALL NOTICES =================
// Admin / Faculty (Manage Notices page)
exports.getAllNotices = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "faculty") {
      query.createdBy = req.user.id;
    }
    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SINGLE NOTICE BY ID =================
// Notice Details page
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate("createdBy", "name");

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
