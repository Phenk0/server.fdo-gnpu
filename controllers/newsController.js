const News = require("../models/newsModel");
const QueryProcessor = require("../utils/processQuery");

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

exports.getAllNews = async (req, res) => {
  try {
    // //BUILD QUERY
    // const query = await processQuery(News, req.query, "-createdAt");
    const query = new QueryProcessor(News, req.query);
    query.filter().sort("-createdAt").limitFields().paginate();

    //EXECUTE QUERY
    const news = await query.query;

    //SEND RESPONSE
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime || new Date().toISOString(),
      results: news?.length,
      data: { news },
    });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};

//Get last month news or last 5
exports.getLatestNews = async (req, res) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  try {
    let news = await News.find()
      .where("tags")
      .in(["NEWS"])
      .where("createdAt")
      .gte(+oneMonthAgo)
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
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};

// get specific news by id
exports.getNewsArticle = async (req, res) => {
  try {
    const newsArticle = await News.findById(req.params.id);

    return res.status(200).json({ status: "success", data: { newsArticle } });
  } catch (err) {
    return res
      .status(404)
      .json({ status: "fail", message: "Новини з таким ID не знайдено" });
  }
};

// add news
exports.addNewsArticle = async (req, res) => {
  try {
    const newsArticle = await News.create(req.body);
    res.status(201).json({ status: "success", data: { newsArticle } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// update news by id
exports.updateNewsArticle = async (req, res) => {
  try {
    const newsArticle = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      status: "success",
      data: {
        newsArticle,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: "fail",
      message: err.message || "Новини з таким ID не знайдено",
    });
  }
};

// delete news by id
exports.deleteNewsArticle = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};

exports.getNewsStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};
