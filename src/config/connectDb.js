const mongoose = require("mongoose");
const connect = async (req, res) => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Db connected successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
module.exports = connect;
