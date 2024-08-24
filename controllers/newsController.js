const News = require("../models/newsModel");
const AppQuery = require("../utils/appQuery");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

// MIDDLEWARE: new news validation
// exports.validateNewsArticle = (req, res, next) => {
//   if (!req.body.title && !req.body.text.length && !req.body.imagesList.length) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Please provide valid article title, text and put type",
//     });
//   }
//   next();
// };

//TIPS FOR MIDDLEWARE in mutating req.query before getter:
// req.query.createdAt = {
//   gte: oneMonthAgo.toISOString(),
// };
// req.query.limit = 100;
// req.query.latest = true;

exports.getAllNews = catchAsync(async (req, res, next) => {
  //BUILD QUERY
  const query = new AppQuery(News, req.query);
  await query.filter().sort("-createdAt").limitFields().paginate();

  //EXECUTE QUERY
  const news = await (query.query || []);

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime || new Date().toISOString(),
    results: news?.length,
    data: { news },
  });
});

//Get last month news or last 5
exports.getLatestNews = catchAsync(async (req, res, next) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  let news = await News.find()
    .where("tags")
    .in(["NEWS"])
    .where("createdAt")
    .gte(Number(oneMonthAgo))
    .sort("-createdAt")
    .select("-__v")
    .limit(100);

  if (news.length < 5) {
    news = await News.find()
      .where("tags")
      .in(["NEWS"])
      .sort({ createdAt: -1 })
      .select("-__v")
      .limit(5);
  }
  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime || new Date().toISOString(),
    results: news?.length,
    data: { news },
  });
});

// get specific news by id
exports.getNewsArticle = catchAsync(async (req, res, next) => {
  const newsArticle = await News.findById(req.params.id);

  if (!newsArticle) {
    return next(new AppError("Новина за таким ID не знайдена", 404));
  }

  res.status(200).json({ status: "success", data: { newsArticle } });
});

// add news
exports.addNewsArticle = catchAsync(async (req, res, next) => {
  const newsArticle = await News.create(req.body);
  res.status(201).json({ status: "success", data: { newsArticle } });
});

// update news by id
exports.updateNewsArticle = catchAsync(async (req, res, next) => {
  const newsArticle = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!newsArticle) {
    return next(new AppError("Новина за таким ID не знайдена", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      newsArticle,
    },
  });
});

// delete news by id
exports.deleteNewsArticle = catchAsync(async (req, res, next) => {
  const newsArticle = await News.findByIdAndDelete(req.params.id);

  if (!newsArticle) {
    return next(new AppError("Новина за таким ID не знайдена", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getNewsStats = catchAsync(async (req, res, next) => {
  const stats = await News.aggregate([
    // separate by tags -- only for mixed tags
    { $unwind: "$tags" },

    // Group by tags and count the occurrences
    {
      $group: {
        _id: {
          tag: { $toUpper: "$tags" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
        countImages: { $sum: { $size: "$imagesList" } },
      },
    },
    {
      $addFields: {
        tag: "$_id.tag",
        year: "$_id.year",
      },
    },
    //remove -_id- from data response
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);

  const statsObj = stats.reduce((acc, stat) => {
    const { tag, year, count, countImages } = stat;
    if (!acc[tag]) {
      acc[tag] = {};
    }
    acc[tag][year] = {
      count,
      countImages,
    };

    return acc;
  }, {});

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime || new Date().toISOString(),
    data: { stats: statsObj },
  });
});
