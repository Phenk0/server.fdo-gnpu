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

// get all news
exports.getAllNews = async (req, res) => {
  try {
    const allNews = await News.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime || new Date().toISOString(),
      result: allNews?.length,
      data: { news: allNews },
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
