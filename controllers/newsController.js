const News = require("../models/newsModel");

//get data from DB
const news = [];

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
    const allNews = await News.find();
    const sortedNews = allNews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      result: sortedNews.length,
      data: { news: sortedNews },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// get specific news by id  --rewrite for MONGO
exports.getNewsArticle = (req, res) => {
  const { id } = req.params;
  const foundNewsArticle = news.find((article) => article.id === id);

  // if (!foundNewsArticle) {
  //   return res
  //     .status(404)
  //     .json({ status: "fail", message: "No news article with that ID" });
  // }

  return res
    .status(200)
    .json({ status: "success", data: { newsArticle: foundNewsArticle } });
};

// add news --rewrite for MONGO
exports.addNewsArticle = async (req, res) => {
  try {
    const newNewsArticle = await News.create(req.body);
    res.status(201).json({ status: "success", data: { news: newNewsArticle } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// update news by id  --rewrite for MONGO
exports.updateNewsArticle = (req, res) => {
  const { id } = req.params;
  const foundNewsArticle = news.find((article) => article.id === id);
  // if (!foundNewsArticle) {
  //   return res
  //     .status(404)
  //     .json({ status: "fail", message: "No news article with that ID" });
  // }
  // TODO: do some updating logic later
  const updatedNewsArticle = Object.assign(foundNewsArticle, req.body);

  return res.status(200).json({
    status: "success",
    data: {
      newsArticle: updatedNewsArticle,
    },
  });
};

// delete news by id  --rewrite for MONGO
exports.deleteNewsArticle = (req, res) => {
  const { id } = req.params;
  const foundNewsArticleIndex = news.findIndex((article) => article.id === id);

  // if (foundNewsArticleIndex === -1) {
  //   return res
  //     .status(404)
  //     .json({ status: "fail", message: "No news article with that ID" });
  // }
  // TODO: do some deleting logic later
  news.splice(foundNewsArticleIndex, 1);

  return res.status(204).json({
    status: "success",
    data: null,
  });
};
