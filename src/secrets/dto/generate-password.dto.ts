import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratePasswordDto {
  @ApiPropertyOptional({
    description: 'Password length',
    default: 16,
    minimum: 1,
    maximum: 256,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(256)
  length?: number;

  @ApiPropertyOptional({
    description: 'Custom character set to use for generation',
    default:
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  })
  @IsOptional()
  @IsString()
  charset?: string;
}
