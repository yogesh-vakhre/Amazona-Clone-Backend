var express = require("express");
var router = express.Router();
const productController = require("../controllers/product.controller.js");
const { restrictTo } = require("../middleware/restrictTo");
const authMiddleware = require("../middleware/auth.middleware.js");

// Create a new product
router.post("/", authMiddleware, productController.create);

// Retrieve all categories
router.get("/", authMiddleware, productController.findAll);

// Create single product for reviews
router.post(
  "/:id/reviews",
  authMiddleware,
  productController.createProductReviews
);

// Retrieve a product categories
router.get("/categories", authMiddleware, productController.productCategories);

// Retrieve a single product with id
router.get("/:id", authMiddleware, productController.findById);

// Retrieve a single product with slug
router.get("/slug/:slug", authMiddleware, productController.findOne);

// Update a product with id
router.patch("/:id", authMiddleware, productController.update);

// Delete a product with id
router.delete("/:id", authMiddleware, productController.delete);

// delete many product
router.delete("/", authMiddleware, productController.deleteAll);

module.exports = router;
