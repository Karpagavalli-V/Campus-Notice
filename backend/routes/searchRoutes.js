const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Notice = require("../models/Notice");
const User = require("../models/User");

const router = express.Router();

// Unified search
router.get("/", protect, async (req, res) => {
  try {
    const { query, filter, department, company } = req.query;
    
    if (!query) {
      return res.json({ posts: [], users: [] });
    }

    const searchRegex = new RegExp(query, "i");
    
    // Build user search
    const userQuery = {
      $or: [{ name: searchRegex }, { department: searchRegex }, { rollNumber: searchRegex }]
    };
    const users = await User.find(userQuery).select("-password").limit(10);
    
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

    const notices = await Notice.find(noticeQuery).populate("createdBy", "name profilePic").limit(50);
    
    // Split notices into Posts and Events based on category
    const posts = notices;
    const events = notices.filter(n => n.category === 'Events'); 

    res.json({
        users,
        posts,
        events
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
