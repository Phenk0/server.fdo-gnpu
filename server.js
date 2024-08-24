const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(
    err.name,
    err.message || "UNHANDLED EXCEPTION!",
    " 💥 Shutting down...",
  );
  process.exit(1);
});

//adds .env.local data to process.env
dotenv.config({ path: "./.env.local" });

const app = require("./app");

const DB = process.env.DATABASE_CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(
    err.name,
    err.message || "UNHANDLED REJECTION!",
    " 💥 Shutting down...",
  );
  server.close(() => process.exit(1));
});
//    "@babel/polyfill": "^7.12.1",

//     "nodemailer": "^6.9.9",
//     "sharp": "^0.33.2",
//     "stripe": "^14.17.0"
