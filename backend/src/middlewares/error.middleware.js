import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // If it's an ApiError, use its data
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error("ERROR:", err);

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export { errorHandler };
