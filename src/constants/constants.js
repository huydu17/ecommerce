const role = {
  admin: "Admin",
  user: "User",
};
const paymentStatus = {
  paid: "Đã thanh toán",
  not_paid: "Chưa thanh toán",
};
const payMethod = {
  COD: "Thanh toán khi nhận hàng",
  Pay_Online: "Thanh toán Online",
};
const orderStatus = {
  pending: "Chờ xử lý",
  approved: "Đã xác nhận",
  intransit: "Đang vận chuyển",
  delivered: "Đã giao",
};
const currency = {
  vnd: "vnd",
  usd: "usd",
};
module.exports = { role, payMethod, paymentStatus, orderStatus, currency };
