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
    //BUILD QUERY
    console.log("start", req.query);
    //1) Filter
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1A) Advanced filtering
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte|in|all|eq)\b/g,
      (n) => `$${n}`,
    );

    let query = News.find(JSON.parse(queryStr));
    /*ALT: .where("createdAt")
      .gte("2023-12-01");*/
    //2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   console.log(sortBy);
    //   query.sort(sortBy); // just in case
    // } else {
    //   //ALT: query.sort("-createdAt");
    //   query.sort({ createdAt: -1 }); //default sorting
    // }

    //3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.splite(",").join(" ");
      query = query.populate(fields);
    } else {
      query = query.populate("news", "-ratingAverage - ratingQuantity");
    }

    //EXECUTE QUERY
    const news = await query;

    //SEND RESPONSE
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime || new Date().toISOString(),
      result: news?.length,
      data: { news },
    });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err });
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
