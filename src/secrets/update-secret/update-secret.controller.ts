import { Controller, Put, Param, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UPDATE_SECRET_SERVICE } from '../domain/update-secret.service.interface';
import type { IUpdateSecretService } from '../domain/update-secret.service.interface';
import { UpdateSecretDto } from '../dto/update-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class UpdateSecretController {
  constructor(
    @Inject(UPDATE_SECRET_SERVICE)
    private readonly updateSecretService: IUpdateSecretService,
  ) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update a secret' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSecretDto,
  ): Promise<SecretResponseDto> {
    return this.updateSecretService.execute(id, dto);
  }
}
