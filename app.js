const express = require("express");
const morgan = require("morgan");

// importing ROUTES
const newsRouter = require("./routes/newsRoutes");
const staffRouter = require("./routes/staffRoutes");
const usersRouter = require("./routes/usersRoutes");

const app = express();

//MIDDLEWARE: log all requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//MIDDLEWARE: modify requests (POST, PUT, PATCH, DELETE) to get json from body
app.use(express.json());

//MIDDLEWARE: add request time to all requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//apply ROUTES via middlewares
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/users", usersRouter);

module.exports = app;
