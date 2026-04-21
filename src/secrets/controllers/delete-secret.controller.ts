import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeleteSecretService } from '../services/delete-secret.service';

@ApiTags('Secrets')
@Controller('secrets')
export class DeleteSecretController {
  constructor(private readonly deleteSecretService: DeleteSecretService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a secret' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteSecretService.execute(id);
  }
}
