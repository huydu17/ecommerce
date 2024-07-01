require("dotenv").config();
const express = require("express");
const path = require("path");
const connect = require("./config/connectDb");
const fs = require("fs");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { globalErrHandle, notFound } = require("./middlewares/globalErrHandle");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const colorRoute = require("./routes/colorRoute");
const brandRoute = require("./routes/brandRoute");
const reviewRoute = require("./routes/reviewRoute");
const orderRoute = require("./routes/orderRoute");
const Order = require("./models/orderModel");
const couponRoute = require("./routes/couponRoute");
const { paymentMethod, paymentStatus } = require("./constants/constants");
const app = express();

//stripe webhook
const stripe = new Stripe(process.env.SECRET_KEY);
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_73fe15890abcc4b832145e86cd99e552992367dd5a9b92fc4c15366a52902714";
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { orderId } = session.metadata;
      const currency = session.currency;
      const order = await Order.findByIdAndUpdate(JSON.parse(orderId), {
        paymentStatus: paymentStatus.paid,
        paymentMethod: paymentMethod.Pay_Online,
        currency,
      });
      order.save();
    } else {
      return;
    }
    // Return a 200 response to acknowledge receipt of the event
    response.sendStatus(200).send();
  }
);
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  "/src/data/images",
  express.static(path.join(__dirname, "data", "images"))
);
app.use(cookieParser());
app.use(bodyParser.json());

//user routes
app.use("/api/users/", userRoute);
//product routes
app.use("/api/products/", productRoute);
//category routes
app.use("/api/categories/", categoryRoute);
//color routes
app.use("/api/colors/", colorRoute);
//brand routes
app.use("/api/brands", brandRoute);
//review routes
app.use("/api/reviews", reviewRoute);
//order routes
app.use("/api/orders", orderRoute);
//coupon routes
app.use("/api/coupons", couponRoute);
//Error Handler
app.use("*", notFound);

app.use("/", globalErrHandle);

app.use("/", (req, res) => {
  res.send("Hello World");
});
const PORT = process.env.PORT || 5000;
connect().then(async () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
