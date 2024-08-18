const Staff = require("../models/stuffModel");
const { processQuery } = require("../utils/processQuery");

exports.getAllStaff = async (req, res) => {
  try {
    // //BUILD QUERY
    req.query.limit = 100;
    // req.query.sort = "positionRank,name";
    const staff = await processQuery(Staff, req.query, "positionRank name");

    //EXECUTE QUERY
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
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};

exports.addStaffMember = async (req, res) => {
  try {
    const staffMember = await Staff.create(req.body);
    res.status(201).json({ status: "success", data: { staff: staffMember } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
