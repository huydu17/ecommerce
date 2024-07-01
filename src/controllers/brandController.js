const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");

//create brand
const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brandExists = await Brand.findOne({ name: name });
  if (brandExists) {
    res.status(400);
    throw new Error("Brand đã tồn tại");
  }
  const brand = await Brand.create({
    name: name.toLowerCase(),
    user: req.user._id,
  });
  res.status(201).json({
    status: true,
    message: "Tạo brand thành công",
    data: brand,
  });
});

//get all brand
const getAllBrand = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  res.status(200).json({
    status: true,
    message: "Lấy brand thành công",
    data: brands,
  });
});

//get Brand by id
const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (brand) {
    res.status(200).json({
      status: true,
      message: "Lấy brand thành công",
      data: brand,
    });
  } else {
    res.status(404);
    throw new Error("Brand không tồn tại");
  }
});

//update Brand
const updateBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    {
      name: name,
    },
    {
      new: true,
    }
  );
  if (!brand) {
    res.status(404);
    throw new Error("Brand không tồn tại");
  }
  await brand.save();
  res.status(200).json({
    status: true,
    message: "Cập nhật brand thành công",
    data: brand,
  });
});

//delete Brand
const deleteBrand = asyncHandler(async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: true,
    message: "Xóa brand thành công",
  });
});

module.exports = {
  createBrand,
  getAllBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
};
