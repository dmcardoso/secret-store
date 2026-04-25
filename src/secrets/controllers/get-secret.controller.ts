import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GET_SECRET_SERVICE } from '../domain/get-secret.service.interface';
import type { IGetSecretService } from '../domain/get-secret.service.interface';
import { SecretResponseDto } from '../dto/secret-response.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class GetSecretController {
  constructor(
    @Inject(GET_SECRET_SERVICE)
    private readonly getSecretService: IGetSecretService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a secret by id' })
  async get(@Param('id') id: string): Promise<SecretResponseDto> {
    return this.getSecretService.execute(id);
  }
}
