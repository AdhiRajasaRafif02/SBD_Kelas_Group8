const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    console.log("Connecting to MongoDB:", dbUrl.split("@")[1]); // Log sanitized URL

    await mongoose.connect(dbUrl, {});
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
