import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotaExceededException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'Quota Exceeded',
        message,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
