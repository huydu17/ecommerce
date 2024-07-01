const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const deletefile = require("../utils/deletefile");

//create product
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, brand, category, sizes, colors, totalQty } =
    req.body;
  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    new Error("Sản phẩm đã tồn tại");
  }
  const checkCategory = await Category.findOne({ name: category });
  if (!checkCategory) {
    res.status(401);
    throw new Error("Không tồn tại danh mục");
  }
  const checkBrand = await Brand.findOne({ name: brand });
  if (!checkBrand) {
    res.status(401);
    throw new Error("Không tồn tại brand");
  }
  const product = await Product.create({
    name,
    description,
    price,
    user: req.user._id,
    brand,
    category,
    sizes,
    colors,
    totalQty,
    images: req.file.path,
  });
  checkCategory.products.push(product._id);
  checkBrand.products.push(product._id);
  await checkBrand.save();
  await checkCategory.save();
  res.status(201).json({
    status: true,
    message: "Thêm sản phẩm thành công",
    data: product,
  });
});

//get all products
const getAllProducts = asyncHandler(async (req, res) => {
  let productQuery = Product.find().populate("reviews");
  //get products by name
  if (req.query.name) {
    productQuery = productQuery.find({
      name: { $regex: req.query.name, $options: "i" },
    });
  }
  //get product by sizes
  if (req.query.sizes) {
    productQuery = productQuery.find({
      sizes: { $regex: req.query.sizes, $options: "i" },
    });
  }
  //get product by brand
  if (req.query.brand) {
    productQuery = productQuery.find({
      brand: { $regex: req.query.brand, $options: "i" },
    });
  }
  //get product by range price
  if (req.query.price) {
    const price = req.query.price.split("-");
    //gte: greater or equal
    //lte: less than or equal
    productQuery = productQuery.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    });
  }
  //paging
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments();
  productQuery = productQuery.skip(startIndex).limit(limit);
  //pagination
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  const products = await productQuery;
  res.status(200).json({
    status: true,
    message: "Lấy sản phẩn thành công",
    pagination,
    data: products,
  });
});

//get product by id
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("reviews");
  if (!product) {
    res.status(404);
    throw new Error("Sản phẩm không tồn tại");
  }
  res.status(200).json({
    status: true,
    message: "Lấy sản phẩm thành công",
    data: product,
  });
});

//update product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, brand, category, sizes, colors, totalQty } =
    req.body;
  const product = await Product.findById(req.params.id);
  if (req.file) {
    product.images.map((img) => {
      deletefile(img);
    });
  }
  if (!product) {
    res.status(404);
    throw new Error("Sản phẩm không tồn tại");
  }
  const productUpdate = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      price,
      brand,
      category,
      sizes,
      colors,
      totalQty,
      images: req.file ? req.file.path : product.images,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: true,
    message: "Cập nhật sản phẩm thành công",
    data: productUpdate,
  });
});

//delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Sản phẩm không tồn tại");
  }
  product.images.map((img) => {
    deletefile(img);
  });
  res.status(200).json({
    status: true,
    message: "Xóa sản phẩm thành công",
  });
});
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
