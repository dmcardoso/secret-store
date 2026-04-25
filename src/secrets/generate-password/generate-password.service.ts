import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { IGeneratePasswordService } from '../domain/generate-password.service.interface';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { GeneratePasswordResponseDto } from '../dto/generate-password-response.dto';

@Injectable()
export class GeneratePasswordService implements IGeneratePasswordService {
  private static readonly DEFAULT_LENGTH = 16;
  private static readonly DEFAULT_CHARSET =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  execute(dto: GeneratePasswordDto): GeneratePasswordResponseDto {
    const len = dto.length ?? GeneratePasswordService.DEFAULT_LENGTH;
    const chars = dto.charset ?? GeneratePasswordService.DEFAULT_CHARSET;
    const randomBytes = crypto.randomBytes(len);
    const result: string[] = [];
    for (let i = 0; i < len; i++) {
      result.push(chars[randomBytes[i] % chars.length]);
    }
    return { password: result.join('') };
  }
}
