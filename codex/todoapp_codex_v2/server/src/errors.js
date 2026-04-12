export class AppError extends Error {
  constructor(statusCode, message, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(404, message, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Request validation failed.") {
    super(400, message, "VALIDATION_ERROR");
  }
}
