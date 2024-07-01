const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      require: true,
    },
    message: {
      type: String,
      required: [true, "Vui lòng nhập nội dung"],
    },
    rating: {
      type: Number,
      required: [true, "Vui lòng đánh giá từ 1-5"],
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
