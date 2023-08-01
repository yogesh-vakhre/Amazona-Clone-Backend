const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const authErrors = require("../utils/errors");
const { JWT_SECRET } = require("../config/app");

const authMiddleware = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  //  check if a bearer token
  if (authHeader && authHeader.split(" ")[0] === "Bearer") {
    token = authHeader.split(" ")[1];
  }

  // Check token
  if (!token) {
    return next(new AppError(authErrors.notLoggedIn, 401));
  }

  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  // Check User
  if (!currentUser) {
    return next(new AppError(authErrors.tokenUserDoesNotExist, 401));
  }

  // Check current user changePasswordAfter date
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError(authErrors.userChangedPassword, 401));
  }
  //console.log(currentUser);
  req.user = currentUser;

  return next();
});

module.exports = authMiddleware;
