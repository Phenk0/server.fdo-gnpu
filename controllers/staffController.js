const Staff = require("../models/stuffModel");
const AppQuery = require("../utils/appQuery");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllStaff = catchAsync(async (req, res, next) => {
  // //BUILD QUERY
  const query = new AppQuery(Staff, req.query);

  query.filter().sort("positionRank name").limitFields();

  const staff = await (query.query || []);

  //EXECUTE QUERY via AGGREGATE
  // const staff = await Staff.aggregate([
  //   {
  //     $match: req.query.department
  //       ? { department: req.query.department }
  //       : {},
  //   },
  //   {
  //     $addFields: {
  //       positionRank: {
  //         $switch: {
  //           branches: [
  //             { case: { $eq: ["$position", "завідувач"] }, then: 1 },
  //             { case: { $eq: ["$position", "професор"] }, then: 2 },
  //             { case: { $eq: ["$position", "доцент"] }, then: 3 },
  //             { case: { $eq: ["$position", "старший викладач"] }, then: 4 },
  //             { case: { $eq: ["$position", "викладач"] }, then: 5 },
  //             { case: { $eq: ["$position", "асистент"] }, then: 6 },
  //             { case: { $eq: ["$position", "старший лаборант"] }, then: 7 },
  //           ],
  //           default: 8,
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       __v: 0,
  //     },
  //   },
  //   { $sort: { positionRank: 1, name: 1 } },
  // ]);

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime || new Date().toISOString(),
    results: staff?.length,
    data: { staff },
  });
});

exports.getStaffMember = catchAsync(async (req, res, next) => {
  const staffMember = await Staff.findById(req.params.id);

  if (!staffMember) {
    return next(new AppError("Працівник з таким ID не знайдений", 404));
  }

  res.status(200).json({ status: "success", data: { staffMember } });
});

exports.addStaffMember = catchAsync(async (req, res, next) => {
  const staffMember = await Staff.create(req.body);
  res.status(201).json({ status: "success", data: { staff: staffMember } });
});
