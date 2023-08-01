const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const hpp = require("hpp");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/error.controller");

const indexRouter = require("./routes/index.routes");

const app = express();

// Configure CORS Policies
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
};
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Basic rate-limiting middleware for Express
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 create account requests per `window` (here, per hour)
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Setup Express middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp());

// Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());

// Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and url params
app.use(xss());

// Express middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection
app.use(mongoSanitize());

//Setup all routes
app.use("/api/v1/", indexRouter);

// Default page
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to RESTful API",
  });
});

//add restriction for routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
