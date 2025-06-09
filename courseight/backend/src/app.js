const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import routes
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const progressRoutes = require("./routes/progress");
const discussionRoutes = require("./routes/discussions");
const assessmentRoutes = require("./routes/assessments");
const errorMiddleware = require("./middleware/error");

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173", // Specify your exact frontend URL
    credentials: true, // Allow credentials
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_temporary_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      ttl: 60 * 60 * 24, // 1 day
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/assessments", assessmentRoutes);

// 404 route
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
