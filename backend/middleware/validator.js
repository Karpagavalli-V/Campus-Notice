const { body, validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const signupValidation = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("role").isIn(["admin", "faculty", "student"]).withMessage("Invalid role"),
    validateRequest,
];

const loginValidation = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
];

const noticeValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("expiryDate").notEmpty().withMessage("Expiry date is required"),
    validateRequest,
];

module.exports = {
    signupValidation,
    loginValidation,
    noticeValidation,
};
