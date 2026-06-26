export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export class AppError extends Error {

    constructor(
        message: string,
        public statusCode: number
    ) {

        super(message);

        Error.captureStackTrace(this, this.constructor);

    }

}