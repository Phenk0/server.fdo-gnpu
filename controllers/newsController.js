const fs = require("fs");

// get data from filesystem
const news = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/announcements-list.json`, "utf-8"),
);

// check if news article exists -- callback for PARAM MIDDLEWARE
exports.checkId = (req, res, next, value) => {
  const foundNewsArticle = news.find((article) => article.id === value);

  if (!foundNewsArticle) {
    return res
      .status(404)
      .json({ status: "fail", message: "No news article with that ID" });
  }
  next();
};

// MIDDLEWARE: new news validation
exports.validateNewsArticle = (req, res, next) => {
  if (!req.body.title || !req.body.text.length || !req.body.type) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide valid article title, text and put type",
    });
  }
  next();
};

// get all news
exports.getAllNews = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: news.length,
    data: { news },
  });
};

// get specific news by id
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

// add news TODO: rewrite json in strait ordered way by ID and accordingly UNSHIFT change to PUSH method
exports.addNewsArticle = (req, res) => {
  // const newId = news[news.length - 1].id + 1;
  const newId = (news[0].id * 1 + 1).toString();
  const newNewsArticle = { id: newId, ...req.body };

  news.unshift(newNewsArticle);

  fs.writeFile(
    `${__dirname}/../data/announcements-list.json`,
    JSON.stringify(news),
    (err) => {
      res
        .status(201)
        .json({ status: "success", data: { news: newNewsArticle } });
    },
  );
};
// update news by id
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

// delete news by id
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
