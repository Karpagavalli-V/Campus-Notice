const express = require("express");
const noticeController = require("../controllers/noticeController");
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
  upload.single("attachment"),
  noticeController.createNotice
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



router.get(
  "/:id",
  protect,
  noticeController.getNoticeById
);

// ================= ADD COMMENT =================
router.post(
  "/:id/comment",
  protect,
  noticeController.addComment
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
// Admin only
router.get(
  "/archive",
  protect,
  authorizeRoles("admin", "faculty"),
  noticeController.getArchivedNotices
);

module.exports = router;



