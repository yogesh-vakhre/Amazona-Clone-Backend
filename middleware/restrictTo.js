const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    console.log("req.user.role", req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  });
};
