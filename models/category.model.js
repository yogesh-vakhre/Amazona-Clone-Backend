const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    description: { type: String, default: null },
    published: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("category", userSchema);
