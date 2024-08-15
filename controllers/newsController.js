const News = require("../models/newsModel");

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
exports.aliasLatestNews = (req, res, next) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  req.query.createdAt = {
    gte: oneMonthAgo.toISOString(),
  };
  req.query.limit = 100;
  req.query.latest = true;

  next();
};
// get all news
exports.getAllNews = async (req, res) => {
  try {
    //BUILD QUERY
    //1) Filter
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields", "latest"];
    excludedFields.forEach((field) => delete queryObj[field]);

    //1A) Advanced filtering
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte|in|all|eq)\b/g,
      (match) => `$${match}`,
    );

    const query = News.find(JSON.parse(queryStr));
    /*ALT: .where("createdAt")
      .gte("2023-12-01");*/
    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query.sort(sortBy); // just in case
    } else {
      //ALT: query.sort("-createdAt");
      query.sort({ createdAt: -1 }); //default sorting
    }

    //3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query.select(fields);
    } else {
      query.select("-__v"); //more limiting at NewsModel
    }

    //4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).limit(limit);

    if (req.query.page) {
      const numNews = await News.countDocuments();
      if (skip >= numNews) throw new Error("This page does not exist");
    }

    //EXECUTE QUERY
    let news = await query;
    //For last month news quantity less than 5 just send latest 5 news
    if (req.query.latest && news.length < 5) {
      news = await News.find().sort({ createdAt: -1 }).select("-__v").limit(5);
    }

    //SEND RESPONSE
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime || new Date().toISOString(),
      result: news?.length,
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
