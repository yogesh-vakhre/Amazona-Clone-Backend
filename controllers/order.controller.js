const eventEmitter = require("../eventListeners/sendOrderEmail");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create and Save a new Order
exports.create = catchAsync(async (req, res, next) => {
  // Create a Order
  const order = await Order.create({
    orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    itemsPrice: req.body.itemsPrice,
    shippingPrice: req.body.shippingPrice,
    taxPrice: req.body.taxPrice,
    totalPrice: req.body.totalPrice,
    user: req.user._id,
  });

  if (!order) {
    return next(
      new AppError("Some error occurred while creating the Order", 400)
    );
  }

  res.status(200).json({
    status: "success",
    message: "New Order Created",
    order,
  });
});

// Retrieve all Order from the database.
exports.findAll = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name");

  res.status(200).json({
    status: "success",
    orders,
  });
});

// Retrieve User Order from the database.
exports.findAllUserOrder = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    status: "success",
    orders,
  });
});

// Find a single Order with an id
exports.findById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  //Find a single Order
  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError("Not found Order with id " + id, 404));
  }

  res.status(200).json({
    status: "success",
    order,
  });
});

// Update deliver a Order by the id in the request
exports.deliverUpdate = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findByIdAndUpdate(
    id,
    { isDelivered: true, deliveredAt: Date.now() },
    {
      useFindAndModify: false,
      new: true,
    }
  );
  if (!order) {
    return next(new AppError("Order Not Found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Order was delivered successfully.",
    order,
  });
});

// Update pay a Order by the id in the request
exports.payUpdate = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findByIdAndUpdate(
    id,
    {
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      },
    },
    {
      useFindAndModify: false,
      new: true,
    }
  );
  if (!order) {
    return next(new AppError("Order Not Found!", 404));
  }

  eventEmitter.emit("sendPayOrderEmail", {
    order,
    origin: req.headers.origin,
  });
  res.status(200).json({
    status: "success",
    message: "Order was paid successfully.",
    order,
  });
});

// Delete a Order with the specified id in the request
exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findByIdAndRemove(id, {
    useFindAndModify: false,
  });
  if (!order) {
    return next(new AppError("Order Not Found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Order was deleted successfully.",
    order,
  });
});

// Find all summary Order
exports.findAllSummary = catchAsync(async (req, res, next) => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        numOrders: { $sum: 1 },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);
  const users = await User.aggregate([
    {
      $group: {
        _id: null,
        numUsers: { $sum: 1 },
      },
    },
  ]);
  const dailyOrders = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        sales: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const productCategories = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    users,
    orders,
    dailyOrders,
    productCategories,
  });
});
