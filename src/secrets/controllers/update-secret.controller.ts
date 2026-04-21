import { Controller, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdateSecretService } from '../services/update-secret.service';
import { UpdateSecretDto } from '../dto/update-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class UpdateSecretController {
  constructor(private readonly updateSecretService: UpdateSecretService) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update a secret' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSecretDto,
  ): Promise<SecretResponseDto> {
    return this.updateSecretService.execute(id, dto);
  }
}
