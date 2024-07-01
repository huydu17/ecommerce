const colorRoute = require("express").Router();
const {
  createColor,
  getAllColor,
  getColorById,
  updateColor,
  deleteColor,
} = require("../controllers/colorController");
const { isLogin } = require("../middlewares/authMiddleware");
//create color
deleteColor, colorRoute.post("/", isLogin, createColor);
//get all colors
colorRoute.get("/", getAllColor);
//get color by id
colorRoute.get("/:id", getColorById);
//update color
colorRoute.put("/:id", updateColor);
//detete color
colorRoute.delete("/:id", deleteColor);

module.exports = colorRoute;
