const { Schema, model } = require("mongoose");

const newsSchema = new Schema({
  // id: "865",
  tags: {
    type: [String],
    required: true,
    enum: [
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
    default: ["NEWS"],
  },
  title: { type: String /*, required: [true, "Новина має містити назву"] */ },
  shortCut: { type: String, trim: true },
  imagesList: { type: [String] },
  text: { type: [String] },
  component: { type: String },
  pdfUrl: { type: String, trim: true },
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
  ratingAverage: { type: Number, default: 0, select: false },
  ratingQuantity: { type: Number, default: 0, select: false },
  hidden: { type: Boolean, default: false },
});

// QUERY MIDDLEWARE
newsSchema.pre(/^find/, function (next) {
  this.find().where("hidden").ne(true).select("-hidden");
  next();
});

const News = model("News", newsSchema);

module.exports = News;
