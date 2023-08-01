var express = require("express");
var router = express.Router();
const categoryController = require("../controllers/category.controller.js");

// Create a new Category
router.post("/", categoryController.create);

// Retrieve all categories
router.get("/", categoryController.findAll);

// Retrieve all published categories
router.get("/published", categoryController.findAllPublished);

// Retrieve a single Category with id
router.get("/:id", categoryController.findOne);

// Update a Category with id
router.put("/:id", categoryController.update);

// Delete a Category with id
router.delete("/:id", categoryController.delete);

// Create a new Category
router.delete("/", categoryController.deleteAll);

module.exports = router;
