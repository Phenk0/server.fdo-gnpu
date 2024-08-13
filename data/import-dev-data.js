const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const News = require("../models/newsModel");

//adds .env.local data to process.env
dotenv.config({ path: `${__dirname}/../.env.local` });

const DB = process.env.DATABASE_CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// importing old json:
const oldNews = JSON.parse(
  fs.readFileSync(`${__dirname}/announcements-list.json`, "utf-8"),
);

// IMPORT DATA INTO MONGODB
const importData = async () => {
  try {
    const result = await News.create(oldNews);
    console.log("Data successfully loaded!", result.length);
    await mongoose.disconnect();
  } catch (err) {
    console.log("ERROR in model 💥", err);
  }
};

//DELETE ALL DATA FROM COLLECTION

const deleteData = async () => {
  try {
    await News.deleteMany();
    console.log("Data successfully deleted!");
    await mongoose.disconnect();
  } catch (err) {
    console.log("ERROR in model 💥", err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
