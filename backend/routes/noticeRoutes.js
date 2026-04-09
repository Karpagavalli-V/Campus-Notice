const express = require("express");
const noticeController = require("../controllers/noticeController");
const { noticeValidation } = require("../middleware/validator");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ================= CREATE NOTICE =================
// Admin / Faculty
router.post(
  "/",
  protect,
  authorizeRoles("admin", "faculty"),
  upload.array("attachments", 10),
  noticeValidation,
  noticeController.createNotice
);

// ================= UPDATE NOTICE =================
// Admin / Faculty
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "faculty"),
  upload.array("attachments", 10),
  noticeValidation,
  noticeController.updateNotice
);

// ================= ACTIVE NOTICES =================
// All users (Admin / Faculty / Student)
router.get(
  "/",
  protect,
  noticeController.getNotices
);

// ================= ALL NOTICES =================
// Admin / Faculty (for manage notices page)
router.get(
  "/all",
  protect,
  authorizeRoles("admin", "faculty"),
  noticeController.getAllNotices
);



// ================= FACULTY ANALYTICS =================
router.get(
  "/stats/me",
  protect,
  authorizeRoles("faculty"),
  noticeController.getMyStats
);

router.get(
  "/:id",
  protect,
  noticeController.getNoticeById
);

// ================= SAVED NOTICES =================
router.post(
  "/:id/save",
  protect,
  noticeController.toggleSaveNotice
);

router.get(
  "/saved/all",
  protect,
  noticeController.getSavedNotices
);

// ================= READ RECEIPTS =================
router.post(
  "/:id/read",
  protect,
  noticeController.markAsRead
);

// ================= COMMENTS & REPLIES =================
router.post(
  "/:id/comment",
  protect,
  noticeController.addComment
);

router.post(
  "/:id/comment/:commentId/like",
  protect,
  noticeController.toggleLikeComment
);

router.post(
  "/:id/comment/:commentId/reply",
  protect,
  noticeController.addReply
);

router.post(
  "/:id/comment/:commentId/reply/:replyId/like",
  protect,
  noticeController.toggleLikeReply
);

// ================= POLLS =================
router.post(
  "/:id/vote",
  protect,
  noticeController.voteInPoll
);


// ================= DELETE NOTICE =================
// Admin / Faculty
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "faculty"),
  noticeController.deleteNotice
);

// ================= ARCHIVED NOTICES =================
// All roles can see archived notices
router.get(
  "/archive",
  protect,
  noticeController.getArchivedNotices
);

// ================= LIKES =================
router.post(
  "/:id/like",
  protect,
  noticeController.toggleLikeNotice
);

router.post("/:id/reaction", protect, noticeController.toggleReaction);
router.post("/:id/comment/:commentId/reaction", protect, noticeController.toggleCommentReaction);

module.exports = router;



