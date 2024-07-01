const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");

//create color
const createColor = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const colorExists = await Color.findOne({ name: name });
  if (colorExists) {
    res.status(400);
    throw new Error("Color đã tồn tại");
  }
  const color = await Color.create({
    name: name.toLowerCase(),
    user: req.user._id,
  });
  res.status(201).json({
    status: true,
    message: "Tạo color thành công",
    data: color,
  });
});

//get all color
const getAllColor = asyncHandler(async (req, res) => {
  const colors = await Color.find();
  res.status(200).json({
    status: true,
    message: "Lấy color thành công",
    data: colors,
  });
});

//get Color by id
const getColorById = asyncHandler(async (req, res) => {
  const color = await Color.findById(req.params.id);
  if (color) {
    res.status(200).json({
      status: true,
      message: "Lấy color thành công",
      data: color,
    });
  } else {
    res.status(404);
    throw new Error("Color không tồn tại");
  }
});

//update Color
const updateColor = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const color = await Color.findById(req.params.id);
  if (!color) {
    res.status(404);
    throw new Error("Color không tồn tại");
  }
  color.name = name;
  await color.save();
  res.status(200).json({
    status: true,
    message: "Cập nhật color thành công",
    data: color,
  });
});

//delete Color
const deleteColor = asyncHandler(async (req, res) => {
  await Color.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: true,
    message: "Xóa color thành công",
  });
});

module.exports = {
  createColor,
  getAllColor,
  getColorById,
  updateColor,
  deleteColor,
};
