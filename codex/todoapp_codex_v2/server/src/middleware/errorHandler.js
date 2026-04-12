import { AppError } from "../errors.js";

export function notFoundHandler(_request, _response, next) {
  next(new AppError(404, "Route not found.", "ROUTE_NOT_FOUND"));
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    response.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON."
      }
    });
    return;
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR";
  const message =
    error instanceof AppError ? error.message : "An unexpected server error occurred.";

  if (!(error instanceof AppError)) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: {
      code,
      message
    }
  });
}
