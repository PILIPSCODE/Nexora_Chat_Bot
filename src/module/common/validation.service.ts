import { Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ValidationService {
  validate<T>(zodType: ZodType, data: T): T {
    const result = zodType.parse(data);
    return result as T;
  }
}
