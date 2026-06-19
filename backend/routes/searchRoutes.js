const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Notice = require("../models/Notice");
const User = require("../models/User");

const router = express.Router();

// Unified search
router.get("/", protect, async (req, res) => {
  try {
    const { query, filter, department, company, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    // Optionally allow search even without a query string if other filters exist
    if (!query && !department && !filter && !company && !startDate && !endDate) {
      return res.json({ posts: [], events: [], users: [], totalNotices: 0 });
    }

    const searchRegex = new RegExp(query || "", "i");
    
    // Build user search (only if query exists)
    let users = [];
    if (query) {
      const userQuery = {
        $or: [{ name: searchRegex }, { department: searchRegex }, { rollNumber: searchRegex }]
      };
      users = await User.find(userQuery).select("-password").limit(10);
    }
    
    // Build Notice search
    const noticeQuery = {
      isActive: true,
      $or: [{ title: searchRegex }, { content: searchRegex }]
    };
    
    if (filter && filter !== 'All') {
        if (filter === 'Academic') noticeQuery.category = 'Academic';
        else if (filter === 'Non-academic') noticeQuery.category = { $ne: 'Academic' };
        else if (filter === 'Announcements') noticeQuery.category = 'General';
        else noticeQuery.category = filter;
    }
    
    if (department) {
        noticeQuery.department = new RegExp(department, "i");
    }
    
    // Assuming "company" tags could be in content or title
    if (company) {
       noticeQuery.$or = [
          { title: new RegExp(company, "i") },
          { content: new RegExp(company, "i") }
       ];
    }

    if (startDate || endDate) {
      noticeQuery.createdAt = {};
      if (startDate) noticeQuery.createdAt.$gte = new Date(startDate);
      if (endDate) noticeQuery.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalNotices = await Notice.countDocuments(noticeQuery);
    const notices = await Notice.find(noticeQuery)
      .populate("createdBy", "name profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Split notices into Posts and Events based on category
    const posts = notices;
    const events = notices.filter(n => n.category === 'Events'); 

    res.json({
        users,
        posts,
        events,
        totalNotices,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotices / parseInt(limit))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
