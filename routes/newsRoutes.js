const { Router } = require("express");

const {
  getAllNews,
  getNewsArticle,
  addNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  getLatestNews,
  getNewsStats,
} = require("../controllers/newsController");
const { protect } = require("../controllers/authController");

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

router.route("/").get(getAllNews).post(protect, addNewsArticle);

router.route("/latest").get(getLatestNews);
router.route("/stats").get(getNewsStats);

//"/api/v1/news/:id/:type?"  TYPE can be optional parameter!
router
  .route("/:id")
  .get(getNewsArticle)
  .patch(protect, updateNewsArticle)
  .delete(protect, deleteNewsArticle);

module.exports = router;
