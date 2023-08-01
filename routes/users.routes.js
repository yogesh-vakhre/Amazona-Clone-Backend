var express = require("express");
var router = express.Router();
const userController = require("../controllers/user.controller.js");
const { restrictTo } = require("../middleware/restrictTo");
const authMiddleware = require("../middleware/auth.middleware.js");

// Retrieve all users
router.get("/", authMiddleware, restrictTo("Admin"), userController.getUsers);

// User suspend
router.patch(
  "/suspend/:userId",
  authMiddleware,
  restrictTo("Admin"),
  userController.suspendUser
);

// User unsuspend
router.patch(
  "/unsuspend/:userId",
  authMiddleware,
  restrictTo("Admin"),
  userController.unsuspendUser
);

// User delete
router.delete(
  "/:userId",
  authMiddleware,
  restrictTo("Admin"),
  userController.deleteUser
);

// User block
router.patch(
  "/block/:userId",
  authMiddleware,
  restrictTo("Admin"),
  userController.blockUser
);

// User unblock
router.patch(
  "/unblock/:userId",
  authMiddleware,
  restrictTo("Admin"),
  userController.unblockUser
);

// Retrieve a single User with id
router.get(
  "/show/:userId",
  authMiddleware,
  restrictTo("Admin"),
  userController.getUserProfile
);

// Update a User with id
router.patch(
  "/update-profile/:userId",
  authMiddleware,
  restrictTo("Admin"),
  userController.updateUserInfo
);

module.exports = router;
