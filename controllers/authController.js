const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const { sendEmail } = require("../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password and active from output
  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  next();
});

// Routes only for logged-in users
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
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("Користувача з наданим токеном більше не існує", 401),
    );
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Нещодавно користувач змінив пароль. Будь-ласка, авторизуйтеся ще раз",
        401,
      ),
    );
  }

  //5) Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("У вас немає доступу до цієї сторінки", 403));
    }

    next();
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("Немає користувача з такою ел.поштою", 404));
  }

  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save(/*{ validateBeforeSave: false }*/);

  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Забули свій пароль? Надішліть новий пароль та пароль підтвердження за посиланням: ${resetURL}.\n Якщо ви не зробили такий запит, будь ласка, проігноруйте це повідомлення.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Скидання пароля (Токен відновлення дійсний 10 хвилин)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Посилання для скидання пароля відправлено на вашу ел.пошту",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(
      new AppError("Помилка при відправленні пошти. Спробуйте ще раз", 500),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired and there is user, set the new password
  if (!user)
    return next(
      new AppError(
        "Невірний токен скидання пароля або його термін дії скінчився",
        400,
      ),
    );
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //4) Log the user in, send JWT
  createSendToken({ _id: user._id }, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user._id).select("+password");
  if (!user)
    return next(
      new AppError(
        "Немає активного користувача, будь ласка увійдіть знову",
        401,
      ),
    );

  //2) Check if POSTed current password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent, user.password)))
    return next(new AppError("Невірний пароль", 401));
  //3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) Log user in, send JWT
  createSendToken({ _id: user._id }, 200, res);
});
