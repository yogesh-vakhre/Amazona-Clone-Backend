var express = require("express");
var router = express.Router();
const orderController = require("../controllers/order.controller.js");
const { restrictTo } = require("../middleware/restrictTo");
const authMiddleware = require("../middleware/auth.middleware.js");

// Create a new order
router.post("/", authMiddleware, orderController.create);

// Retrieve all order
router.get("/", authMiddleware, restrictTo("Admin"), orderController.findAll);

// Retrieve User all order
router.get("/mine", authMiddleware, orderController.findAllUserOrder);

// Retrieve all summary order
router.get(
  "/summary",
  authMiddleware,
  restrictTo("Admin"),
  orderController.findAllSummary
);

// Retrieve a single order with id
router.get("/:id", authMiddleware, orderController.findById);

// Update deliver a order with id
router.put("/:id/deliver", authMiddleware, orderController.deliverUpdate);

// Update pay a order with id
router.put("/:id/pay", authMiddleware, orderController.payUpdate);

// Delete a order with id
router.delete(
  "/:id",
  authMiddleware,
  restrictTo("Admin"),
  orderController.delete
);

module.exports = router;
