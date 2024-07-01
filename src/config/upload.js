// const cloudinaryPackage = require("cloudinary");
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = cloudinaryPackage.v2;

// //config cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });

// //create storage
// const storage = new CloudinaryStorage({
//   cloudinary,
//   allowedFormats: ["jpg", "png", "jpeg"],
//   params: {
//     folder: "ecommerce_api",
//   },
// });

// const upload = multer({ storage: storage });
// module.exports = upload;

const multer = require("multer");
const path = require("path");
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/data/images/");
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

module.exports = upload;
