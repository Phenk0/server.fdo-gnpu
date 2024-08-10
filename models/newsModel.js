const { Schema, model } = require("mongoose");

const newsSchema = new Schema({
  // id: "865",
  tags: { type: [String], required: true, default: ["news"] },
  title: { type: String /*, required: [true, "Новина має містити назву"] */ },
  shortCut: String,
  imagesList: { type: [String] },
  text: { type: [String] },
  component: { type: String },
  pdfUrl: String,
  createdAt: { type: Date, default: new Date().toISOString() },
  linkTo: String,
});
const News = model("News", newsSchema);

module.exports = News;
