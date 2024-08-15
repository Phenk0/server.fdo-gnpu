const { Router } = require("express");

const {
  getAllNews,
  getNewsArticle,
  addNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  aliasLatestNews,
} = require("../controllers/newsController");

const router = Router();

// router.param("id", (req, res, next, value) => {
//   const foundNewsArticle = news.find((article) => article.id === value);
//   if (!foundNewsArticle) {
//     return res
//       .status(404)
//       .json({ status: "fail", message: "No news article with that ID" });
//   }
//   next();
// });

router.route("/latest").get(aliasLatestNews, getAllNews);

router.route("/").get(getAllNews).post(addNewsArticle);

//"/api/v1/news/:id/:type?"  TYPE can be optional parameter!
router
  .route("/:id")
  .get(getNewsArticle)
  .patch(updateNewsArticle)
  .delete(deleteNewsArticle);

module.exports = router;
