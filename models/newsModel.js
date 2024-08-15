const { Schema, model } = require("mongoose");

const newsSchema = new Schema({
  // id: "865",
  tags: { type: [String], required: true, default: ["news"] },
  title: { type: String /*, required: [true, "Новина має містити назву"] */ },
  shortCut: { type: String, trim: true },
  imagesList: { type: [String] },
  text: { type: [String] },
  component: { type: String },
  pdfUrl: { type: String, trim: true },
  createdAt: {
    type: Date,
    required: [true, "Новина має містити вірну дату"],
    default: new Date().toISOString(),
  },
  linkTo: { type: String, trim: true },
  // For FUTURE:
  ratingAverage: { type: Number, default: 0, select: false },
  ratingQuantity: { type: Number, default: 0, select: false },
});
const News = model("News", newsSchema);

module.exports = News;
