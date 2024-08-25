const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
// const { sendToken } = require("../utils/sendToken");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password provided
  if (!email || !password) {
    return next(
      new AppError("Поля 'Ел.пошта' та 'Пароль' є обов'язковими", 400),
    );
  }
  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  const isCorrectPassword = await user?.comparePassword(
    password,
    user?.password,
  );

  if (!user || !isCorrectPassword) {
    return next(new AppError("Невірна ел.пошта або пароль", 401));
  }

  // Send JWT token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
