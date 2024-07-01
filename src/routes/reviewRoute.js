const reviewRoute = require("express").Router();
const { createReview } = require("../controllers/reviewController");
const { isLogin } = require("../middlewares/authMiddleware");
//create review
reviewRoute.post("/:productId", isLogin, createReview);
//get all reviews

module.exports = reviewRoute;
