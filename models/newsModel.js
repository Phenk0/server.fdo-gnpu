const { Schema, model } = require("mongoose");

const newsSchema = new Schema({
  tags: {
    type: [String],
    required: true,
    enum: {
      values: [
        "NEWS",
        "EVENT",
        "GUEST_LECTURE",
        "PRACTICE",
        "EXTRACURRICULAR",
        "STUDENT_SCIENCE",
        "VACANCIES",
        "PRIDE",
        "TEST",
      ],
      message: "Виберіть дійсну категорію",
    },
    default: ["NEWS"],
  },
  title: { type: String },
  shortCut: { type: String, trim: true },
  imagesList: {
    type: [String],
    validate: [
      function (urlsArr) {
        // If the array is empty, null, or undefined, pass the validation
        if (!urlsArr || urlsArr.length === 0) {
          return true;
        }
        // Regex to validate URLs
        const urlRegex =
          /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/;
        // Check that every URL in the array matches the regex
        return urlsArr.every((imageUrl) => urlRegex.test(imageUrl));
      },
      "Будь-ласка вкажіть дійсну адресу зберігання зображень", // Custom error message
    ],
  },
  text: { type: [String] },
  component: { type: String },
  pdfUrl: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
      "Будь-ласка вкажіть дійсну адресу зберігання PDF документа",
    ],
  },
  createdAt: {
    type: Date,
    required: [true, "Новина має містити вірну дату"],
    default: Date.now, //Date.now() or new Date() will freeze time at startServer point; ALT: ()=>new Date()
  },
  endsAt: {
    type: Date,
  },
  linkTo: { type: String, trim: true },
  // For FUTURE:
  ratingAverage: {
    type: Number,
    default: 4.5,
    select: false,
    min: [1, "Рейтинг має бути не менше 1"],
    max: [5, "Рейтинг має бути не більше 5"],
  },
  ratingQuantity: { type: Number, default: 0, select: false },
  hidden: { type: Boolean, default: false },
  authors: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

// QUERY MIDDLEWARE
newsSchema.pre(/^find/, function (next) {
  this.find().where("hidden").ne(true).select("-hidden");
  next();
});

// gives whole user object to news.authors on find or findById
newsSchema.pre(["find", "findOne"], function (next) {
  this.populate({ path: "authors", select: "-__v -passwordChangedAt" });
  next();
});
// removes -hidden- from aggregate query
newsSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { hidden: { $ne: true } } });
  next();
});

const News = model("News", newsSchema);

module.exports = News;
