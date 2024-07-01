const productRoute = require("express").Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { isLogin, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../config/upload");
//create product
productRoute.post("/", isLogin, isAdmin, upload.single("file"), createProduct);
//get all products
productRoute.get("/", getAllProducts);
productRoute.get("/:id", getProductById);
productRoute.put(
  "/:id",
  isLogin,
  isAdmin,
  upload.single("file"),
  updateProduct
);
productRoute.delete("/:id", isLogin, isAdmin, deleteProduct);

module.exports = productRoute;
