const orderRoute = require("express").Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateStatusOrder,
  getInvoice,
  getOrderStats,
} = require("../controllers/orderController");
const { isLogin } = require("../middlewares/authMiddleware");

//create order
orderRoute.post("/", isLogin, createOrder);
//get all orders
orderRoute.get("/", isLogin, getOrders);
//get order
orderRoute.get("/:id", isLogin, getOrderById);
//update status order
orderRoute.patch("/:id", isLogin, updateStatusOrder);
//get invoice
orderRoute.get("/invoice/:orderid", isLogin, getInvoice);
//get sum
orderRoute.get("/sales/stats", isLogin, getOrderStats);

module.exports = orderRoute;
