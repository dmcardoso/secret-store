import { ApiProperty } from '@nestjs/swagger';

export class GeneratePasswordResponseDto {
  @ApiProperty({ description: 'The generated password' })
  password: string;
}
