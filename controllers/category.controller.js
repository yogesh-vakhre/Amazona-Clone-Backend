const Category = require("../models/category.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create and Save a new Category
exports.create = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (!req.body.title) {
    return next(new AppError("Content can not be empty!", 400));
  }

  // Create a Category
  const category = await Category({
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false,
  }).save();

  if (!category) {
    return next(
      new AppError("Some error occurred while creating the category", 400)
    );
  }

  res.status(200).json({
    status: "success",
    category,
  });
});

// Retrieve all Categorys from the database.
exports.findAll = catchAsync(async (req, res, next) => {
  const title = req.query.title;
  var condition = title
    ? { title: { $regex: new RegExp(title), $options: "i" } }
    : {};

  const category = await Category.find(condition);
  if (!category) {
    return next(
      new AppError("Some error occurred while retrieving categorys", 400)
    );
  }

  res.status(200).json({
    status: "success",
    category,
  });
});

// Find a single Category with an id
exports.findOne = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  //Find a single Category
  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError("Not found category with id " + id, 404));
  }

  res.status(200).json({
    status: "success",
    category,
  });
});

// Update a Category by the id in the request
exports.update = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError("Data to update can not be empty!", 400));
  }

  const id = req.params.id;

  const category = await Category.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false,
    new: true,
  });
  if (!category) {
    return next(
      new AppError(
        "Cannot update category with id=${id}. Maybe category was not found!",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Category was updated successfully.",
    category,
  });
});

// Delete a Category with the specified id in the request
exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const category = await Category.findByIdAndRemove(id, {
    useFindAndModify: false,
  });
  if (!category) {
    return next(
      new AppError(
        "Cannot delete category with id=${id}. Maybe category was not found!",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Category was deleted successfully.",
    category,
  });
});

// Delete all categories from the database.
exports.deleteAll = catchAsync(async (req, res, next) => {
  const categories = await Category.deleteMany({});

  if (!categories) {
    return next(
      new AppError("Some error occurred while removing all categories", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: `${data.deletedCount} categories were deleted successfully!`,
  });
});

// Find all published categories
exports.findAllPublished = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ published: true });

  if (!categories) {
    return next(
      new AppError("Some error occurred while removing all categories", 500)
    );
  }

  res.status(200).json({
    status: "success",
    categories,
  });
});
