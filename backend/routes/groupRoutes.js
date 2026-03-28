const express = require("express");
const groupController = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, groupController.createGroup);
router.get("/", protect, groupController.getGroups);
router.post("/:id/addMember", protect, groupController.addMember);
router.post("/:id/message", protect, groupController.sendMessage);
router.get("/:id/message", protect, groupController.getMessages);
router.post("/:id/message/:messageId/react", protect, groupController.reactToMessage);

module.exports = router;
