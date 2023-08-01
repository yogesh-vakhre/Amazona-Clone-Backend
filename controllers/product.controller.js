const Product = require("../models/product.model");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create and Save a new Product
exports.create = catchAsync(async (req, res, next) => {
  // Create a Product
  const product = await Product.createProduct(req.body);

  if (!product) {
    return next(
      new AppError("Some error occurred while creating the Product", 400)
    );
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

// Retrieve all Products from the database.
exports.findAll = catchAsync(async (req, res, next) => {
  // Create a new APIFeatures instance with the Product model query
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sorting()
    .limiting()
    .pagination();

  // Execute the query
  const products = await features.query;

  res.status(200).json({
    status: "success",
    total: products.length,
    products,
  });
});

// Find a single Product with an id
exports.findById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  //Find a single Product
  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Not found Product with id " + id, 404));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

// Find a single Product with an id
exports.findOne = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  //Find a single Product
  const product = await Product.findOne({ slug });
  if (!product) {
    return next(new AppError("Not found Product with id " + slug, 404));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

// Update a Product by the id in the request
exports.update = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false,
  });
  if (!product) {
    return next(new AppError("Product Not Found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Product was updated successfully.",
    product,
  });
});

// Delete a Product with the specified id in the request
exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findByIdAndRemove(id, {
    useFindAndModify: false,
  });
  if (!product) {
    return next(new AppError("Product Not Found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Product was deleted successfully.",
    product,
  });
});

// Delete all products from the database.
exports.deleteAll = catchAsync(async (req, res, next) => {
  const products = await Product.deleteMany({ _id: req.body.ids });

  if (!products) {
    return next(new AppError("Product Not Found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: `${data.deletedCount} products were deleted successfully!`,
  });
});

// Create single product for reviews
exports.createProductReviews = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError("Product Not Found!", 404));
  }

  if (product.reviews.find((x) => x.userId === req.user._id)) {
    return res.status(400).send({ message: "You already submitted a review" });
  }

  const review = {
    userId: req.user._id,
    rating: Number(req.body.rating),
    comment: req.body.comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((a, c) => c.rating + a, 0) / product.reviews.length;

  const updatedProduct = await product.save();

  res.status(201).send({
    status: "success",
    message: "Review Created",
    review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
    numReviews: product.numReviews,
    rating: product.rating,
  });
});

// Retrieve a product categories
exports.productCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.find().distinct("category");

  res.status(200).send({ status: "success", categories });
});
