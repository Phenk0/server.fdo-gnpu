const express = require("express");
const {
  getAllNews,
  getNewsArticle,
  addNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
} = require("./controllers/newsRoute");

const app = express();

//MIDDLEWARE: modify requests (POST, PUT, PATCH, DELETE) to get json from body
app.use(express.json());

app.route("/api/v1/news").get(getAllNews).post(addNewsArticle);

//"/api/v1/news/:id/:type?"  TYPE can be optional parameter!
app
  .route("/api/v1/news/:id")
  .get(getNewsArticle)
  .patch(updateNewsArticle)
  .delete(deleteNewsArticle);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
