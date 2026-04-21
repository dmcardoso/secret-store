import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetSecretService } from '../services/get-secret.service';
import { SecretResponseDto } from '../dto/secret-response.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class GetSecretController {
  constructor(private readonly getSecretService: GetSecretService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a secret by id' })
  async get(@Param('id') id: string): Promise<SecretResponseDto> {
    return this.getSecretService.execute(id);
  }
}
