const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/update-profile", protect, upload.single("profilePic"), authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/follow/:id", protect, authController.toggleFollow);
router.get("/following", protect, authController.getFollowing);
router.get("/connections", protect, authController.getConnections);

module.exports = router;
