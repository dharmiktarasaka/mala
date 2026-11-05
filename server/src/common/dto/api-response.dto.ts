export class ApiResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  timestamp: string;

  constructor(success: boolean, message: string, data?: T, meta?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data: T, message = 'Success', meta?: any): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data, meta);
  }

  static fail<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto(false, message, data);
  }
}

