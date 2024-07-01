const colorRoute = require("express").Router();
const {
  createColor,
  getAllColor,
  getColorById,
  updateColor,
  deleteColor,
} = require("../controllers/colorController");
const { isLogin, isAdmin } = require("../middlewares/authMiddleware");
//create color
deleteColor, colorRoute.post("/", isLogin, createColor);
//get all colors
colorRoute.get("/", isLogin, isAdmin, getAllColor);
//get color by id
colorRoute.get("/:id", isLogin, isAdmin, getColorById);
//update color
colorRoute.put("/:id", isLogin, isAdmin, updateColor);
//detete color
colorRoute.delete("/:id", isLogin, isAdmin, deleteColor);

module.exports = colorRoute;
