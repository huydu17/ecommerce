const categoryRoute = require("express").Router();
const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { isLogin, isAdmin } = require("../middlewares/authMiddleware");
//create category
deleteCategory, categoryRoute.post("/", isLogin, createCategory);
//get all categories
categoryRoute.get("/", isLogin, isAdmin, getAllCategory);
//get category by id
categoryRoute.get("/:id", isLogin, isAdmin, getCategoryById);
//update category
categoryRoute.put("/:id", isLogin, isAdmin, updateCategory);
//detete category
categoryRoute.delete("/:id", isLogin, isAdmin, deleteCategory);

module.exports = categoryRoute;
