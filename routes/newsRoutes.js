const { Router } = require("express");

const {
  getAllNews,
  getNewsArticle,
  addNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  checkId,
  validateNewsArticle,
} = require("../controllers/newsController");

const router = Router();

router.param("id", checkId);

router.route("/").get(getAllNews).post(validateNewsArticle, addNewsArticle);

//"/api/v1/news/:id/:type?"  TYPE can be optional parameter!
router
  .route("/:id")
  .get(getNewsArticle)
  .patch(updateNewsArticle)
  .delete(deleteNewsArticle);

module.exports = router;
