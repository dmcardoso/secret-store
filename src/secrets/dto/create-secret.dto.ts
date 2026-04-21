import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSecretDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  website: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secretName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
