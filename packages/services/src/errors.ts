// 서비스 레이어 공통 에러 클래스

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource}(${id})을(를) 찾을 수 없습니다` : `${resource}을(를) 찾을 수 없습니다`, 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends ServiceError {
  constructor(message = "접근 권한이 없습니다") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends ServiceError {
  constructor(
    message: string,
    public errors?: Record<string, string>
  ) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}
