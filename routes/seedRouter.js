var express = require("express");
var router = express.Router();
const Product = require("../models/product.model.js");
const data = require("../data.js");
const User = require("../models/user.model.js");

router.get("/", async (req, res) => {
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(data.products);
  //await User.remove({});
  const createdUsers = await User.insertMany(data.users);
  res.send({ createdProducts, createdUsers });
});
module.exports = router;
