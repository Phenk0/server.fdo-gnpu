const { promisify } = require("util");
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

exports.logout = catchAsync(async (req, res, next) => {
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Get token and check if it's there
  let token = "";
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "Ви не авторизовані! Будь-ласка, авторизуйтеся, щоб отримати доступ",
        401,
      ),
    );
  }

  //2) Verify token -- promisify - convert callback to promise(throws caught error)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("Користувача з наданим токеном більше не існує", 401),
    );
  }

  //4) Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Нещодавно користувач змінив пароль. Будь-ласка, авторизуйтеся ще раз",
        401,
      ),
    );
  }

  //5) Grant access to protected route
  req.user = user;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("У вас немає доступу до цієї сторінки", 403));
    }

    next();
  });
