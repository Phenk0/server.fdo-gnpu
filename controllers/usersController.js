const User = require("../models/userModel");
const AppError = require("../utils/appError");
const AppQuery = require("../utils/appQuery");
const { catchAsync } = require("../utils/catchAsync");

// const users = [
//   { id: 1, name: "John Doe" },
//   { id: 2, name: "Jane Doe" },
// ];

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const query = new AppQuery(User, req.query);
  await query.filter().sort().limitFields().paginate();

  const users = await query.query;

  if (!users?.length) {
    return res.status(404).json({ status: "fail", message: "No users found" });
  }
  return res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const foundUser = await User.findById(id);

  if (!foundUser) {
    return res
      .status(404)
      .json({ status: "fail", message: "No user with that ID" });
  }

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: { user: foundUser },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ status: "success", data: { user } });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("Користувача за таким ID не знайдено", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError("Користувача за таким ID не знайдено", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
