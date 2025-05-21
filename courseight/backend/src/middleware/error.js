module.exports = (err, req, res, next) => {
  console.error(err.stack);

  // Handle different types of errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      error: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
      error: "The provided ID is not in a valid format",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate Key Error",
      error: "A record with this key already exists",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";

  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
};
