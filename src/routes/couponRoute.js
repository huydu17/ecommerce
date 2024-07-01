const {
  createCoupon,
  getAllCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { isLogin, isAdmin } = require("../middlewares/authMiddleware");

const couponRoute = require("express").Router();
//create coupon
couponRoute.post("/", isLogin, isAdmin, createCoupon);
//get all coupon
couponRoute.get("/", isLogin, isAdmin, getAllCoupon);
//get coupon by id
couponRoute.get("/:id", isLogin, isAdmin, getCouponById);
//update coupon
couponRoute.put("/:id", isLogin, isAdmin, updateCoupon);
//delete coupon
couponRoute.delete("/:id", isLogin, isAdmin, deleteCoupon);

module.exports = couponRoute;
