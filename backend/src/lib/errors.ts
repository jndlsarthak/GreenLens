export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class ApiError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = 'INTERNAL',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorResponse(error: unknown): { error: string; code: string } {
  if (error instanceof ApiError) {
    return { error: error.message, code: error.code };
  }
  if (error instanceof Error) {
    return { error: error.message, code: ERROR_CODES.INTERNAL };
  }
  return { error: 'An unexpected error occurred', code: ERROR_CODES.INTERNAL };
}

export function getStatusCode(error: unknown): number {
  if (error instanceof ApiError) return error.statusCode;
  return 500;
}
