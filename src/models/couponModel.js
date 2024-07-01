const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      require: true,
    },
    startDate: {
      type: Date,
      require: true,
    },
    endDate: {
      type: Date,
      require: true,
    },
    discount: {
      type: Number,
      require: true,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

//check coupon
couponSchema.virtual("isExpired").get(function () {
  return this.endDate < Date.now();
});
couponSchema.pre("validate", function (next) {
  if (this.endDate < Date.now()) {
    next(new Error("Ngày hết hạn không được bé hơn ngày hiện tại"));
  }
  next();
});
couponSchema.pre("validate", function (next) {
  if (this.startDate > this.endDate) {
    next(new Error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc"));
  }
  next();
});
couponSchema.pre("validate", function (next) {
  if (this.startDate < Date.now()) {
    next(new Error("Ngày bắt đầu phải lớn hơn ngày ngày hiện tại"));
  }
  next();
});
couponSchema.virtual("getDayLeft").get(function (next) {
  const dayLeft =
    "Còn " +
    Math.ceil((this.endDate - Date.now()) / (1000 * 60 * 60 * 24)) +
    " ngày";
  return dayLeft;
});

module.exports = mongoose.model("Coupon", couponSchema);
