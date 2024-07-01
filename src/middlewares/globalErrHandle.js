const globalErrHandle = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode).json({
    stack: process.env.NODE_ENV === "production" ? err.stack : null,
    message: err.message,
  });
};
//404-NotFound
const notFound = (req, res, next) => {
  const err = Error(`Địa chỉ ${req.originalUrl} không tìm thấy`);
  next(err);
};

module.exports = {
  globalErrHandle,
  notFound,
};
