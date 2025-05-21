const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const app = require("./src/app");

// Load environment variables
dotenv.config();

// Define port
const PORT = process.env.PORT || 5000;

// Connect to database
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

// Start server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
