const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // send generic error to the domain provider
  console.error("ERROR: 💥", err);

  return res.status(500).json({
    status: "error",
    message: "Щось пішло дуже не так",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Щось пішло не так";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);

    if (error.name === "CastError") {
      error = new AppError(`Помилковий ${err.path}: ${err.value}.`, 400);
    }
    if (error.code === 11000) {
      error = new AppError(
        `Значення поля '${Object.keys(err.keyValue)[0]}' вже існує: ${Object.values(err.keyValue)[0]}. Будь ласка, використайте інше значення!`,
        400,
      );
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => el.message);
      error = new AppError(`Некоректні вхідні дані: ${errors.join("; ")}`, 400);
    }
    if (error.name === "JsonWebTokenError") {
      error = new AppError("Недійсний токен. Будь ласка, увійдіть знову!", 401);
    }
    if (error.name === "TokenExpiredError") {
      error = new AppError(
        "Термін дії вашого токена закінчився! Будь ласка, увійдіть знову.",
        401,
      );
    }

    sendErrorProd(error, res);
  }
};
