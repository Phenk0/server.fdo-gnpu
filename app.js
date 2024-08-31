const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
// importing ROUTES
const newsRouter = require("./routes/newsRoutes");
const staffRouter = require("./routes/staffRoutes");
const usersRouter = require("./routes/usersRoutes");

const app = express();

//1) GLOBAL MIDDLEWARES:
// Set security HTTP headers
app.use(helmet());

// Log all requests in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 15,
  message: "Забагато запитів з цього IP. Спробуйте пізніше через 15 хвилин",
});
app.use("/api", limiter);

//Body parser: modify requests (POST, PUT, PATCH, DELETE) to get json from body
app.use(
  express.json({
    limit: "10kb",
  }),
);

// Serve static files
app.use(express.static(`${__dirname}/public`));

// Add request time to all requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//apply ROUTES via middlewares
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/users", usersRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Не знайдено ${req.originalUrl} на цьому сервері`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
