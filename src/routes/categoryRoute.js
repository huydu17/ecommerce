const categoryRoute = require("express").Router();
const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { isLogin } = require("../middlewares/authMiddleware");
//create category
deleteCategory, categoryRoute.post("/", isLogin, createCategory);
//get all categories
categoryRoute.get("/", getAllCategory);
//get category by id
categoryRoute.get("/:id", getCategoryById);
//update category
categoryRoute.put("/:id", updateCategory);
//detete category
categoryRoute.delete("/:id", deleteCategory);

module.exports = categoryRoute;
