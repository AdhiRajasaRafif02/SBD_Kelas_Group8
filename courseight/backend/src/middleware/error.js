const errorHandler = (err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  console.error(err.stack);

  // Handle mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: "Validation Error",
      errors: errors,
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
  // Handle authentication errors
  if (err.name === "AuthenticationError") {
    return res.status(401).json({
      message: "Authentication failed",
      error: err.message,
    });
  }

  // Handle authorization errors
  if (err.name === "AuthorizationError") {
    return res.status(403).json({
      message: "Not authorized",
      error: err.message,
    });
  }

  // Handle not found errors
  if (err.name === "NotFoundError") {
    return res.status(404).json({
      message: "Resource not found",
      error: err.message,
    });
  }
  // Default server error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  // In development, send the stack trace
  const response = {
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : 
           process.env.NODE_ENV === "production" ? "Server error" : err.message
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
