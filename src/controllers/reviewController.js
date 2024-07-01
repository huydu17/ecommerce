const expressAsyncHandler = require("express-async-handler");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Review = require("../models/reviewModel");
//create Review
const createReview = asyncHandler(async (req, res) => {
  const { message, rating } = req.body;
  const checkProduct = await Product.findById(req.params.productId);
  if (!checkProduct) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }
  const review = await Review.create({
    message,
    rating,
    user: req.user._id,
    product: checkProduct._id,
  });
  // add reviewId -> product
  checkProduct.reviews.push(review._id);
  await checkProduct.save();
  res.status(201).json({
    status: true,
    message: "Đánh giá thành công",
    data: review,
  });
});

module.exports = { createReview };
