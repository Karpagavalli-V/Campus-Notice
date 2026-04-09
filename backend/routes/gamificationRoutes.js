const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * @route GET /api/gamification/leaderboard
 * @desc Get top users based on XP
 */
router.get("/leaderboard", protect, async (req, res, next) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        
        const topUsers = await User.find(filter)
            .select("name role department xp badges profilePic")
            .sort({ xp: -1 })
            .limit(20);

        res.json(topUsers);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/gamification/me
 * @desc Get current user's XP and badges
 */
router.get("/me", protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("xp badges");
        res.json(user);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
