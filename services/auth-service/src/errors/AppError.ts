export class AppError extends Error {
  public readonly statusCode: number;
  public readonly type: string;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode = 500,
    type = 'https://httpstatuses.com/500',
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.type = type;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication credentials are required and failed verification.') {
    super(message, 401, 'https://httpstatuses.com/401');
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = 'You do not have the required permissions or roles to access this portal.',
    details?: { required?: string[]; actual?: string[] }
  ) {
    const errorMap = details
      ? {
          required: details.required ?? [],
          actual: details.actual ?? [],
        }
      : undefined;
    super(message, 403, 'https://httpstatuses.com/403', errorMap);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    const message = id ? `${resource} with identifier '${id}' was not found.` : `${resource} not found.`;
    super(message, 404, 'https://httpstatuses.com/404');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'A resource with these details already exists.') {
    super(message, 409, 'https://httpstatuses.com/409');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Input validation failed.', errors?: Record<string, string[]>) {
    super(message, 422, 'https://httpstatuses.com/422', errors);
  }
}
