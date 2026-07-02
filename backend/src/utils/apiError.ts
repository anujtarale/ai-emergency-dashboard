class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];
  public code?: number;
  public keyValue?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
