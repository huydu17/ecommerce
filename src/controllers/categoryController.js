const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");

//create category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const categoryExists = await Category.findOne({ name: name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Danh mục đã tồn tại");
  }
  const category = await Category.create({
    name: name.toLowerCase(),
    user: req.user._id,
  });
  res.status(201).json({
    status: true,
    message: "Tạo danh mực thành công",
    data: category,
  });
});

//get all category
const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({
    status: true,
    message: "Lấy danh mục thành công",
    data: categories,
  });
});

//get category by id
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.status(200).json({
      status: true,
      message: "Lấy danh mục thành công",
      data: category,
    });
  } else {
    res.status(404);
    throw new Error("Danh mục không tồn tại");
  }
});

//update category
const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Danh mục không tồn tại");
  }
  category.name = name;
  await category.save();
  res.status(200).json({
    status: true,
    message: "Cập nhật danh mục thành công",
    data: category,
  });
});

//delete category
const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: true,
    message: "Xóa danh mục thành công",
  });
});

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
