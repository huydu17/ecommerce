const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { payMethod } = require("../constants/constants");
require("dotenv").config();
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.SECRET_KEY);

//create order
// /orders/?coupon=
const createOrder = asyncHandler(async (req, res) => {
  const coupon = req.query.coupon;
  console.log(coupon);
  const couponExist = await Coupon.findOne({ code: coupon?.toUpperCase() });
  if (!couponExist) {
    res.status(404);
    throw new Error("Mã không tồn tại");
  }
  if (couponExist?.isExpired) {
    res.status(400);
    throw new Error("Mã đã hết hạn");
  }
  const discount = couponExist?.discount / 100;
  const { orderItems, shippingAddress, paymentMethod } = req.body;
  //find user
  const user = await User.findById(req.user._id);
  if (orderItems?.length <= 0) {
    throw new Error("Giỏ hàng trống");
  }
  let totalPrice = 0;
  orderItems.map((item) => {
    totalPrice += item.price * item.qty;
  });
  //create order
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress: {
      name: shippingAddress.name,
      address: shippingAddress.address,
      phone: shippingAddress.phone,
      message: shippingAddress.message,
    },
    paymentMethod,
    totalPrice: couponExist ? totalPrice - totalPrice * discount : totalPrice,
  });
  user.orders.push(order._id);
  await user.save();
  //update total sold
  const products = await Product.find({ _id: { $in: orderItems } });
  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id.toString() === order?._id.toString();
    });
    if (product) {
      product.totalSold += +order.qty;
    }
    await product.save();
  });
  if (order.paymentMethod === payMethod.COD) {
    return res.status(201).json({
      status: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  }
  //convert order
  const convertOrders = orderItems?.map((item) => {
    return {
      price_data: {
        currency: "vnd",
        product_data: {
          name: item?.name,
        },
        unit_amount: item?.price,
      },
      quantity: item?.qty,
    };
  });
  // stripe payment
  const session = await stripe.checkout.sessions.create({
    line_items: convertOrders,
    metadata: {
      orderId: JSON.stringify(order?._id),
    },
    mode: "payment",
    success_url: `http://localhost:3000/success`,
    cancel_url: `http://localhost:3000/cancel`,
  });
  res.send({ url: session.url });
});

//get orders
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({});
  if (!orders) {
    throw new Error("Chưa có đơn hàng nào");
  }
  res.status(200).json({
    status: true,
    message: "Lấy tất cả đơn hàng thành công!",
    data: orders,
  });
});

//get order by id
const getOrderById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Đơn hàng không tồn tại");
  }
  res.status(200).json({
    succses: true,
    message: "Lấy đơn hàng thành công",
    data: order,
  });
});

//update status order
const updateStatusOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const order = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: true,
    message: "Cập nhật thành công",
    data: order,
  });
});

//get invoice
const getInvoice = asyncHandler(async (req, res) => {
  //instance pdf
  const doc = new PDFDocument();
  const orderId = req.params.orderid;
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Không tồn tại đơn hàng");
  }
  const invoicename = `Hoá đơn ${orderId}.pdf`;
  const invoicepath = path.join("src", "data", "invoices", invoicename);
  doc.pipe(fs.createWriteStream(invoicepath));
  doc.pipe(res);
  doc.fontSize(26).text(`Invoice`, {
    underline: true,
  });
  doc.text("-----------------------");
  let totalPrice = 0;
  order.orderItems.forEach((prod) => {
    totalPrice = order.totalPrice;
    doc.fontSize(14).text(prod.name + " - " + prod.qty + " x " + prod.price);
  });
  doc.text("---");
  doc.fontSize(20).text("Total Price:" + totalPrice + "vnd");
  doc.end();
});

//get order stats
const getOrderStats = asyncHandler(async (req, res) => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSales: {
          $min: "$totalPrice",
        },
        sumSales: {
          $sum: "$totalPrice",
        },
        maximumSales: {
          $max: "$totalPrice",
        },
        avgSales: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  //get day
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const salesToday = await Order.aggregate([
    {
      $match: {
        createAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);
  res.status(200).json({
    status: true,
    message: "Lấy tổng thành công",
    orders,
    salesToday,
  });
});
module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatusOrder,
  getInvoice,
  getOrderStats,
};
