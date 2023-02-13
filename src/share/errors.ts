import { HttpException, HttpStatus } from '@nestjs/common';

class MyHttpException extends HttpException {
  constructor(reason: Record<string, [string]>, status: HttpStatus) {
    super({ errors: reason }, status);
  }
}

// for 401
export class UnauthorizedError extends MyHttpException {
  constructor(reason: Record<string, [string]>) {
    super(reason, HttpStatus.UNAUTHORIZED);
  }
}

// for 403
export class ForbiddenError extends MyHttpException {
  constructor(reason: Record<string, [string]>) {
    super(reason, HttpStatus.FORBIDDEN);
  }
}

// for 404
export class NotFoundError extends MyHttpException {
  constructor(reason: Record<string, [string]>) {
    super(reason, HttpStatus.NOT_FOUND);
  }
}

// for 422
export class UnprocessableEntityError extends MyHttpException {
  constructor(reason: Record<string, [string]>) {
    super(reason, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
