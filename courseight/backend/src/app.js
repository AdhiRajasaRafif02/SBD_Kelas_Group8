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

// CORS configuration for both development and Docker deployment
const allowedOrigins = [
  "http://localhost:5173", // Development frontend
  "http://localhost:3000", // Alternative dev port
  "http://localhost:80", // Docker frontend
  "http://frontend:80", // Docker service name
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
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
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false, // Set to false for Docker/localhost environment
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
