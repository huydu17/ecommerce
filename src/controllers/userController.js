const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
var parser = require("ua-parser-js");
const sendEmail = require("../utils/sendMail");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const hashToken = require("../utils/hashToken");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.CRYPTR_KEY);

//register
const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập tất cả thông tin");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Tài khoản đã tồn tại");
  }
  // const salt = await bcrypt.genSalt(10);
  // const hashPassWord = await bcrypt.hash(password, salt);
  //get userAgent
  const ua = parser(req.headers["user-agent"]);
  const userAgent = ua.ua;
  const user = await User.create({
    userName,
    email,
    password,
    userAgent: userAgent,
  });
  //generate token
  const token = await generateToken(user._id);
  //Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });
  console.log(req.cookies);
  if (user) {
    res.status(201).json({
      status: true,
      message: "Đăng ký thành công",
      data: user,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error("Đăng ký không thành công");
  }
});

//login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập tất cả thông tin");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Sai mật khẩu");
  }
  //Trigge 2FA for unKnown UserAgent
  const ua = parser(req.headers["user-agent"]);
  const thisUserAgent = ua.ua;
  const allowAgent = user.userAgent.includes(thisUserAgent);
  if (!allowAgent) {
    //generate code
    const logincode = Math.floor(100000 + Math.random() * 900000);
    //encrypt login code before save db
    const encryptedLoginCode = cryptr.encrypt(logincode.toString());
    const userToken = await Token.findOne({ userId: user._id });
    console.log("logincode", logincode);
    if (userToken) {
      userToken.deleteOne();
    }
    const token = new Token({
      userId: user._id,
      lToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000),
    });
    await token.save();
    console.log(token);
    res.status(400);
    throw new Error("Vui lòng kiểm tra email của bạn để lấy mã xác nhận");
  }
  const token = await generateToken(user._id);
  if (user && isMatch) {
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({
      status: true,
      message: "Đăng nhập thành công",
      data: user,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error("Tài khoản hoặc mật khẩu không đúng!");
  }
});

//send login code
const sendLoginCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  console.log("Email", req.params);
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  const userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });
  console.log("Token", userToken);
  if (!userToken) {
    res.status(404);
    throw new Error("Token không tồn tại");
  }
  const loginCode = userToken.lToken;
  const decryptedString = cryptr.decrypt(loginCode);
  console.log("ma xac nhan", decryptedString);
  const subject = "Mã xác nhận";
  const sent_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = process.env.EMAIL_USER;
  const template = "sendLoginCode";
  const name = user.userName;
  const link = decryptedString;
  try {
    await sendEmail(
      subject,
      sent_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({
      status: true,
      message: "Gửi email thành công",
    });
  } catch (e) {
    res.status(500);
    throw new Error(e.message);
  }
});

//login with code
const loginWithCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  const userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Token không tồn tại");
  }
  const decryptToken = cryptr.decrypt(userToken.lToken);
  console.log("ma xac nhan 2", decryptToken);
  console.log("ma xac nhan 3", loginCode);
  if (decryptToken !== loginCode) {
    res.status(400);
    throw new Error("Mã xác nhận không đúng");
  } else {
    const ua = parser(req.headers["user-agent"]);
    const thisUserAgent = ua.ua;
    user.userAgent.push(thisUserAgent);
    user.save();
    //generate cookie
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({
      status: true,
      message: "Đăng nhập thành công",
      data: user,
      token: token,
    });
    res.status(200).json({
      status: true,
      message: "Đăng nhập thành công",
    });
  }
});

//sendVerificationEmail
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("Tài khoản đã được xác thực");
  }
  //check token exists in db
  const token = await Token.findOne({ userId: user._id });
  if (token) {
    token.deleteOne();
  }
  //create verification token
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(verificationToken);
  //hash token
  const hashedToken = hashToken(verificationToken);
  new Token({
    userId: user._id,
    vToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000),
  }).save();
  //verification url
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
  console.log(verificationUrl);
  //send Email
  const subject = "Xác thực tài khoản";
  const sent_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = process.env.EMAIL_USER;
  const template = "verifyEmail";
  const name = user.userName;
  const link = verificationUrl;
  try {
    await sendEmail(
      subject,
      sent_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({
      status: true,
      message: "Gửi email thành công",
    });
  } catch (e) {
    res.status(500);
    throw new Error(e.message);
  }
});

//verify user
const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  const hashedToken = hashToken(verificationToken);
  const userToken = await Token.findOne({
    vToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Token không tồn tại");
  }
  const user = await User.findById({ _id: userToken.userId });
  if (user.isVerified) {
    res.status(400);
    throw new Error("Tài khoản đã được xác thực");
  }
  user.isVerified = true;
  await user.save();
  res.status(200).json({
    status: true,
    message: "Xác thực người dùng thành công!",
  });
});

//logout
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json("Đăng xuất thành công!");
});

//getUser
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("orders");
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  res.status(200).json({
    status: true,
    message: "Lấy thông tin thành công",
    data: user,
  });
});

//get all user
const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: true,
    message: " Tất cả người dùng",
    data: users,
  });
});

//changeRole
const changRole = asyncHandler(async (req, res) => {
  const { role, id } = req.body;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
  user.role = role;
  await user.save();
  res.status(200).json({
    status: true,
    message: "Cập nhật role thành công",
    data: user,
  });
});

//send Automated email
const sendAutomatedEmail = asyncHandler(async (req, res) => {
  const { subject, sent_to, reply_to, template, url } = req.body;
  if (!subject || !sent_to || !reply_to || !template) {
    res.status(404);
    throw new Error("Vui lòng nhập tất cả thông tin");
  }
  const user = await User.findOne({ email: sent_to });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  const name = user.userName;
  const link = `${process.env.FRONTEND_URL}${url}`;
  const sent_from = process.env.EMAIL_USER;
  try {
    await sendEmail(
      subject,
      sent_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({
      status: true,
      message: "Gửi email thành công",
    });
  } catch (e) {
    res.status(500);
    throw new Error(e.message);
  }
});

//forgotPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  //check token exists in db
  const token = await Token.findOne({ userId: user._id });
  if (token) {
    token.deleteOne();
  }
  //create verification token
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);
  //hash token
  const hashedToken = hashToken(resetToken);
  new Token({
    userId: user._id,
    rToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000),
  }).save();
  //verification url
  const resetUrl = `${process.env.FRONTEND_URL}/verify/${resetToken}`;
  console.log(resetUrl);
  //send Email
  const subject = "Reset password";
  const sent_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = process.env.EMAIL_USER;
  const template = "forgotPassword";
  const name = user.userName;
  const link = resetUrl;
  try {
    await sendEmail(
      subject,
      sent_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({
      status: true,
      message: "Gửi yêu cầu thành công",
    });
  } catch (e) {
    res.status(500);
    throw new Error(e.message);
  }
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { resettoken } = req.params;
  const { password } = req.body;
  console.log(req.params);

  const hashedToken = hashToken(resettoken);
  const userToken = await Token.findOne({
    rToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Token không tồn tại");
  }
  const user = await User.findOne({ _id: userToken.userId });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  user.password = password;
  await user.save();
  res.status(200).json({
    status: true,
    message: "Đổi mật khẩu thành công",
  });
});

//changePassword
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(req.body);
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  if (!oldPassword || !newPassword) {
    res.status(404);
    throw new Error("Vui lòng nhập tất cả thông tin");
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Mật khẩu cũ không đúng");
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    status: true,
    message: "Đổi mật khẩu thành công",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getAllUser,
  changRole,
  sendAutomatedEmail,
  sendVerificationEmail,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendLoginCode,
  loginWithCode,
};
