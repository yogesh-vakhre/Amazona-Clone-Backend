const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
