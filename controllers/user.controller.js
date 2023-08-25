const User = require("../models/user.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Retrieve all Users from the database.
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $match: {
        role: { $ne: "Admin" },
      },
    },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        role: 1,
        status: 1,
      },
    },
  ]);

  res.status(200).json({ users });
});
// Get User profile
exports.getUserProfile = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    user,
  });
});

// Suspend User
exports.suspendUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      status: "Suspended",
    },
    {
      useFindAndModify: false,
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    message: "User suspended successfully",
  });
});

// Unsuspend User
exports.unsuspendUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      status: "Active",
    },
    {
      useFindAndModify: false,
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    message: "User unsuspended successfully",
  });
});

// Delete all Users from the database.
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    message: "User deleted successfully",
  });
});

// Block User
exports.blockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      status: "Blocked",
    },
    {
      useFindAndModify: false,
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    message: "User blocked successfully",
  });
});

// Unblock User
exports.unblockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      status: "Active",
    },
    {
      useFindAndModify: false,
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    message: "User unblocked successfully",
  });
});

// Update a User by the id in the request
exports.updateUserInfo = catchAsync(async (req, res, next) => {
  const { firstName, lastName, password, confirmPassword } = req.body;

  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }
  user.firstName = firstName;
  user.lastName = lastName;

  if (password !== "" && confirmPassword !== "") {
    user.password = password;
  }

  const data = await user.save({
    validateBeforeSave: false,
  });
  res.status(200).json(data);
});
