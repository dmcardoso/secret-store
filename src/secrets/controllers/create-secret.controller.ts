import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateSecretService } from '../services/create-secret.service';
import { CreateSecretDto } from '../dto/create-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class CreateSecretController {
  constructor(private readonly createSecretService: CreateSecretService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new secret' })
  async create(@Body() dto: CreateSecretDto): Promise<SecretResponseDto> {
    return this.createSecretService.execute(dto);
  }
}
