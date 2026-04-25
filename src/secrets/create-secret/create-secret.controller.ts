import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CREATE_SECRET_SERVICE } from '../domain/create-secret.service.interface';
import type { ICreateSecretService } from '../domain/create-secret.service.interface';
import { CreateSecretDto } from '../dto/create-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class CreateSecretController {
  constructor(
    @Inject(CREATE_SECRET_SERVICE)
    private readonly createSecretService: ICreateSecretService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new secret' })
  async create(@Body() dto: CreateSecretDto): Promise<SecretResponseDto> {
    return this.createSecretService.execute(dto);
  }
}
