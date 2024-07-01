const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");

//create coupon
const createCoupon = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  const couponExist = await Coupon.findOne({ code: code?.toUpperCase() });
  if (couponExist) {
    res.status(400);
    throw new Error("Mã đã tồn tại");
  }
  if (isNaN(discount) || discount <= 0 || discount >= 100) {
    res.status(400);
    throw new Error("Mã không hợp lệ");
  }
  const coupon = await Coupon.create({
    code: code?.toUpperCase(),
    startDate,
    endDate,
    discount,
    user: req.user._id,
  });
  res.status(201).json({
    status: true,
    message: "Tạo mã thành công",
    data: coupon,
  });
});

//get all coupon
const getAllCoupon = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    status: true,
    message: "Lấy mã thành công",
    data: coupons,
  });
});

//get coupon by id
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  //check if is not found
  if (coupon === null) {
    throw new Error("Coupon not found");
  }
  //check if expired
  if (coupon.isExpired) {
    throw new Error("Coupon Expired");
  }
  res.json({
    status: "success",
    message: "Coupon fetched",
    coupon,
  });
});

//update coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      code: code?.toUpperCase(),
      discount,
      startDate,
      endDate,
    },
    {
      new: true,
    }
  );
  res.json({
    status: "success",
    message: "Coupon updated successfully",
    coupon,
  });
});

//delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Xoá mã thành công",
  });
});

module.exports = {
  createCoupon,
  getAllCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
