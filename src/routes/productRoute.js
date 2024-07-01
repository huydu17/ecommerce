const productRoute = require("express").Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { isLogin } = require("../middlewares/authMiddleware");
const upload = require("../config/upload");
//create product
productRoute.post("/", isLogin, upload.single("file"), createProduct);
//get all products
productRoute.get("/", getAllProducts);
productRoute.get("/:id", getProductById);
productRoute.put("/:id", isLogin, upload.single("file"), updateProduct);
productRoute.delete("/:id", deleteProduct);

module.exports = productRoute;
