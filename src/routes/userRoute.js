const userRoute = require("express").Router();
const {
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
} = require("../controllers/userController");
const { isLogin, isAdmin } = require("../middlewares/authMiddleware");
//register
userRoute.post("/register", registerUser);
//login
userRoute.post("/login", loginUser);
//logout
userRoute.post("/logout", isLogin, logoutUser);
//get user
userRoute.get("/get-user", isLogin, getUser);
//get all User
userRoute.get("/", isLogin, isAdmin, getAllUser);
//change role
userRoute.patch("/change-role", isLogin, isAdmin, changRole);
//send email
userRoute.post("/sendEmail", isLogin, sendAutomatedEmail);
//verification token
userRoute.post("/sendVerificationEmail", isLogin, sendVerificationEmail);
//verify user
userRoute.patch("/verify-user/:verificationToken", isLogin, verifyUser);
//forgot password
userRoute.post("/forgotPassword", forgotPassword);
//reset password
userRoute.patch("/reset-password/:resettoken", resetPassword);
//change password
userRoute.patch("/change-password", isLogin, changePassword);
//send code email
userRoute.post("/sendLoginCode/:email", sendLoginCode);
//loginWithCode
userRoute.post("/loginWithCode/:email", loginWithCode);
module.exports = userRoute;
