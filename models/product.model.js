const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Please provide your slug"],
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please provide your image"],
    },
    images: { type: String, default: null },
    brand: { type: String, required: [true, "Please provide your brand"] },
    category: {
      type: String,
      required: [true, "Please provide your category"],
    },
    description: {
      type: String,
      required: [true, "Please provide your description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide your price"],
    },
    countInStock: {
      type: Number,
      required: [true, "Please provide your countInStock"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide your rating"],
    },
    numReviews: {
      type: Number,
      required: [true, "Please provide your number reviews"],
    },
    reviews: [],
  },
  { timestamps: true }
);

// Create User
productSchema.statics.createProduct = async function (data) {
  const product = await this.create({ ...data });

  return product;
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
