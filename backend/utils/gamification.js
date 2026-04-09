const User = require("../models/User");

const XP_MAP = {
    "POST_NOTICE": 50,
    "VOTE_POLL": 20,
    "COMMENT": 15,
    "REPLY": 10,
    "LIKE_NOTICE": 5,
    "REACTION": 5,
    "READ_NOTICE": 2, // Reading early
};

/**
 * Award XP to a user and check for badges
 */
exports.awardXP = async (userId, action) => {
    try {
        const xpToAdd = XP_MAP[action] || 0;
        if (xpToAdd === 0) return;

        const user = await User.findById(userId);
        if (!user) return;

        user.xp = (user.xp || 0) + xpToAdd;

        // Simple Badge Logic
        const currentBadgeNames = user.badges.map(b => b.name);

        if (user.xp >= 100 && !currentBadgeNames.includes("Bronze Contributor")) {
            user.badges.push({ name: "Bronze Contributor", icon: "🥉" });
        }
        if (user.xp >= 500 && !currentBadgeNames.includes("Silver Participant")) {
            user.badges.push({ name: "Silver Participant", icon: "🥈" });
        }
        if (user.xp >= 1000 && !currentBadgeNames.includes("Gold Legend")) {
            user.badges.push({ name: "Gold Legend", icon: "🥇" });
        }

        await user.save();
        return { xpAdded: xpToAdd, newTotal: user.xp };
    } catch (error) {
        console.error("Error awarding XP:", error);
    }
};
