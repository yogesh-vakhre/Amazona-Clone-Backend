const User = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateToken = require("../utils/generateToken");
const { authErrors } = require("../utils/errors");
const eventEmitter = require("../eventListeners/sendAuthEmail");

const { JWT_SECRET } = require("../config/app");

// SignUp a new User
exports.signUp = catchAsync(async (req, res, next) => {
  // Get user input
  const { email } = req.body;
  // Validate if user exist in our database
  const userPresent = await User.findOne({ email });
  // check if user already exist
  if (userPresent) {
    return next(new AppError(authErrors.userAlreadyExists, 409));
  }

  // Create user in our database
  const user = await User.createUser(req.body);
  if (!user) {
    return next(
      new AppError("Some error occurred while creating the user", 400)
    );
  }

  // send email verification link
  eventEmitter.emit("sendVerificationEmail", {
    user,
    origin: req.headers.origin,
  });
  // return user
  res.status(200).json({
    status: "success",
    token: generateToken(user._id), // Create token
    user,
  });
});

// Login a User
exports.login = catchAsync(async (req, res, next) => {
  // Get user input
  let { email, password } = req.body;

  // Validate user input
  email = email.toLowerCase();
  if (!email) {
    return next(new AppError(authErrors.provideEmail, 404));
  }
  if (!password) {
    return next(new AppError(authErrors.providePassword, 404));
  }
  // Validate if user exist in our database
  const user = await User.findOne({ email }).select("+password");
  //check if user email not valid
  if (!user) {
    return next(new AppError(authErrors.invalidUser, 400));
  }

  //check if user not email Verified
  if (!user.emailVerified) {
    const newUser = await User.recreateEmailVerification(user.email);

    eventEmitter.emit("sendVerificationEmail", {
      user: newUser,
      origin: req.headers.origin,
    });
    return next(new AppError(authErrors.emailNotVerified, 401));
  }

  //reset password token
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save({ validateBeforeSave: false });

  //check if user password not valid
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(authErrors.invalidUser, 401));
  }
  user.password = undefined;

  // user
  res.status(200).json({
    status: "success",
    token: generateToken(user._id), // Create token
    user,
  });
});

// Login as Admin
exports.loginAsAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) {
    return next(new AppError(authErrors.provideEmail, 404));
  }
  if (!password) {
    return next(new AppError(authErrors.providePassword, 404));
  }

  const user = await User.findOne({
    email,
    role: "Admin",
  }).select("+password");
  if (!user) {
    return next(new AppError(authErrors.invalidUser, 401));
  }
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(authErrors.invalidUser, 401));
  }
  user.password = undefined;

  res.status(200).json({
    status: "success",
    token: generateToken(user._id),
    user,
  });
});

// Email Verification by User
exports.checkEmailVerification = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log("hashedToken", hashedToken);
  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyTokenExpires: { $gt: Date.now() },
  });
  if (user) {
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpires = undefined;
    user.status = "Active";
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: "success",
      token: generateToken(user._id),
      user,
      message: "Email verified successfully",
    });
  } else {
    return next(new AppError("Token is invalid or expired", 400));
  }
});

// Verify Token by User
exports.verifyToken = catchAsync(async (req, res, next) => {
  const token = req.body.token;
  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
  const user = await User.findById(decoded.id);

  //Check user
  if (!user) {
    return next(new AppError("User does not exist", 400));
  }
  res.status(200).json({
    status: "success",
    message: "Token is valid",
  });
});

// Forgot password by User
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(authErrors.userNotFound, 404));
  }

  const newUser = user.createPasswordResetToken(req.body.email);

  try {
    eventEmitter.emit("sendPasswordResetEmail", {
      user: newUser,
      origin: req.headers.origin,
    });
    res.status(200).json({
      status: "success",
      message:
        "We sent reset password link to your email.Check your email for reset password link",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. try again later", 500)
    );
  }
});

// Reset password by User
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  res.status(200).json({
    status: "success",
    token: generateToken(user._id),
    user,
  });
});

// Update password by User
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  // Check currentPassword is valid
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError(authErrors.currentPasswordWrong, 400));
  }

  // Check currentPassword and newPassword  is not same
  if (req.body.currentPassword === req.body.newPassword) {
    return next(new AppError(authErrors.passwordSameAsPrevious, 400));
  }

  // Check newPassword and confirmPassword is same
  if (req.body.confirmPassword !== req.body.newPassword) {
    return next(new AppError(authErrors.passwordNotMatch, 400));
  }
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  const token = generateToken(user._id);
  user.token = token;

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "Succesfully change password",
    token: token,
  });
});

// Get User information
exports.getUserInfo = catchAsync(async (req, res, next) => {
  console.log(req.user._id);
  const data = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    user: data,
    message: "Profile updated successfully",
  });
});

// Edit User information
exports.editUserInfo = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phoneNo } = req.body;
  const user = await User.findById(req.user._id);
  user.firstName = firstName;
  user.lastName = lastName;
  user.phoneNo = phoneNo;
  const data = await user.save({
    validateBeforeSave: false,
  });
  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    user: data,
  });
});
