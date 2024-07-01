const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        default: "",
      },
    ],
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      ref: "Category",
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
      enum: ["S", "M", "L", "XL", "XXL"],
    },
    colors: {
      type: [String],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    totalQty: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSold: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

//calcalator total review
productSchema.virtual("totalReview").get(function () {
  return this.reviews.length;
});
//average
productSchema.virtual("averageRating").get(function () {
  let total = 0;
  const product = this;
  product?.reviews?.forEach((review) => {
    total += review.rating;
  });
  const averageRating = Number(total / product?.reviews?.length).toFixed(1);
  return averageRating;
});
//quantity left
productSchema.virtual("qtyLeft").get(function () {
  return this.totalQty - this.totalSold;
});
module.exports = mongoose.model("Product", productSchema);
