const mongoose = require("mongoose");
const dotenv = require("dotenv");

//adds config.env data to process.env
dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE_CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// importing old news to DB:

// console.log(oldNews.length);
// oldNews
//   .map((item) => new News(item))
//   .forEach((item) => {
//     item
//       .save()
//       .then((doc) => console.log(doc.createdAt))
//       .catch((err) => console.warn("ERROR in model 💥", err));
//   });

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
//    "@babel/polyfill": "^7.12.1",
//     "axios": "^1.6.7",
//     "bcrypt": "^5.1.1",
//     "compression": "^1.7.4",
//     "cookie-parser": "^1.4.6",
//     "dotenv": "^16.3.1",
//     "express": "^4.18.2",
//     "express-mongo-sanitize": "^2.2.0",
//     "express-rate-limit": "^7.1.5",
//     "helmet": "^7.1.0",
//     "hpp": "^0.2.3",
//     "html-to-text": "^9.0.5",
//     "jsonwebtoken": "^9.0.2",
//     "mongoose": "^8.0.1",
//     "morgan": "^1.10.0",
//     "multer": "^1.4.5-lts.1",
//     "nodemailer": "^6.9.9",
//     "pug": "^3.0.2",
//     "sharp": "^0.33.2",
//     "slugify": "^1.6.6",
//     "stripe": "^14.17.0",
//     "validator": "^13.11.0",
//     "xss-clean": "^0.1.4"
