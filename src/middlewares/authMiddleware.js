const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { role } = require("../constants/constants");
//check login
const isLogin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Vui lòng đăng nhập");
    }
    //verify token
    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verifyToken.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("Tài khoản không tồn tại");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

//check admin
const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === role.admin) {
    next();
  } else {
    res.status(401);
    throw new Error("Bạn không có quyền truy cập");
  }
});

module.exports = { isLogin, isAdmin };
