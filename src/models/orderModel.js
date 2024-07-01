const mongoose = require("mongoose");
const {
  paymentStatus,
  payMethod,
  orderStatus,
  currency,
} = require("../constants/constants");
//generate random number
const randomTxt = Math.random().toString(36).substring(7).toLocaleLowerCase();
const randomNumbers = Math.floor(1000 + Math.random() * 90000);
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        type: Object,
        require: true,
      },
    ],
    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        require: true,
      },
      phone: {
        type: String,
        require: true,
      },
      message: {
        type: String,
        default: "",
      },
    },
    orderNumber: {
      type: String,
      default: randomTxt + randomNumbers,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: paymentStatus.not_paid,
    },
    paymentMethod: {
      type: String,
      require: true,
      default: payMethod.COD,
    },
    currency: {
      type: String,
      default: currency.vnd,
    },
    status: {
      type: String,
      require: true,
      default: orderStatus.pending,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
