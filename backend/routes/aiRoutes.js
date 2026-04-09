const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { refineNoticeText, suggestCategory } = require("../utils/aiService");

const router = express.Router();

/**
 * @route POST /api/ai/refine
 * @desc Refine notice content with (mock) AI
 */
router.post("/refine", protect, authorizeRoles("faculty", "admin"), async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: "No text provided" });
        }

        const refinedText = await refineNoticeText(text);
        const suggestedCategory = await suggestCategory(text);

        res.json({
            refinedText,
            suggestedCategory,
            tokensSaved: Math.floor(Math.random() * 100) + 50 // Just for gamification feel
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
