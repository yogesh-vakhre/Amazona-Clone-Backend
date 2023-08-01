var express = require("express");
var router = express.Router();
const authController = require("../controllers/auth.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

// Sign up a new User
router.post("/sign-up", authController.signUp);

// Sign in User
router.post("/sign-in", authController.login);

// Sign as Admin
router.post("/sign-in-as-admin", authController.loginAsAdmin);

// Email verification;
router.get("/email-verification/:token", authController.checkEmailVerification);

// Verify Token;
router.post("/verify-token", authController.verifyToken);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.patch("/reset-password/:token", authController.resetPassword);

// Get current user
router.get("/get-profile", authMiddleware, authController.getUserInfo);

// Edit current user
router.patch("/edit-user", authMiddleware, authController.editUserInfo);

// Update current user password
router.patch("/update-password", authMiddleware, authController.updatePassword);

module.exports = router;
