const brandRoute = require("express").Router();
const {
  createBrand,
  getAllBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");
const { isLogin } = require("../middlewares/authMiddleware");
//create brand
brandRoute.post("/", isLogin, createBrand);
//get all categories
brandRoute.get("/", getAllBrand);
//get brand by id
brandRoute.get("/:id", getBrandById);
//update brand
brandRoute.put("/:id", updateBrand);
//detete brand
brandRoute.delete("/:id", deleteBrand);

module.exports = brandRoute;
