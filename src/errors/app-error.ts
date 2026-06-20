export type ErrorCode =
  | 'validation_error'
  | 'not_found'
  | 'upstream_unavailable'
  | 'unauthorized'
  | 'conflict'
  | 'internal_error';

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details: unknown = undefined
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorBody(error: AppError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details })
    }
  };
}
