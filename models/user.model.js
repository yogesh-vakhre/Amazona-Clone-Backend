const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/app");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please tell us your First name"],
    },
    lastName: {
      type: String,
      required: [true, "Please tell us your  Last name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    role: {
      type: String,
      enum: ["Customer", "Admin"],
      default: "Customer",
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      // required: [true, "Please provide a confirm password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Paassword are not the same",
      },
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide your date of birth"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneNo: {
      type: String,
      required: [true, "Please provide your phone number"],
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Suspended",
        "Deleted",
        "Blocked",
        "Pending",
      ],
      default: "Pending",
    },
    hasAcceptedTerms: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerifyToken: String,
    emailVerifyTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Create User
userSchema.statics.createUser = async function (data) {
  const user = await this.create({ ...data });
  user.confirmPassword = undefined;
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.emailVerifyTokenExpires = Date.now() + 30 * 60 * 1000;

  user.save({ validateBeforeSave: false });
  user.resetToken = resetToken;
  return user;
};

// recreate Email Verification email User
userSchema.statics.recreateEmailVerification = async function (email) {
  const user = await this.findOne({
    email: email,
  });
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.emailVerifyTokenExpires = Date.now() + 30 * 60 * 1000;

  user.save({ validateBeforeSave: false });
  user.resetToken = resetToken;
  return user;
};

// Generate bcrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

// Generate bcrypt password after save passwordChangedAt
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Check password User
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Save changePasswordAfter date time
userSchema.methods.changePasswordAfter = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JwtTimeStamp < changeTimestamp;
  }
  return false;
};

// Create Password Reset Token User
userSchema.methods.createPasswordResetToken = function (email) {
  const resetToken = jwt.sign({ email: email }, JWT_SECRET, {
    expiresIn: "10m",
  });

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  this.save({ validateBeforeSave: false });
  this.resetToken = resetToken;
  //console.log("this obj", this);
  return this;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
