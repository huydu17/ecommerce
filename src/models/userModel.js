const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { role, paymethMethod } = require("../constants/constants");
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Vui lòng nhập tên"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
        "Email không hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
      default: role.user,
    },
    userAgent: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

module.exports = mongoose.model("user", userSchema);
