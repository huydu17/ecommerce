const brandRoute = require("express").Router();
const {
  createBrand,
  getAllBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");
const { isLogin, isAdmin } = require("../middlewares/authMiddleware");
//create brand
brandRoute.post("/", isLogin, isAdmin, createBrand);
//get all categories
brandRoute.get("/", isLogin, isAdmin, getAllBrand);
//get brand by id
brandRoute.get("/:id", isLogin, isAdmin, getBrandById);
//update brand
brandRoute.put("/:id", isLogin, isAdmin, updateBrand);
//detete brand
brandRoute.delete("/:id", isLogin, isAdmin, deleteBrand);

module.exports = brandRoute;
