import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DELETE_SECRET_SERVICE } from '../domain/delete-secret.service.interface';
import type { IDeleteSecretService } from '../domain/delete-secret.service.interface';

@ApiTags('Secrets')
@Controller('secrets')
export class DeleteSecretController {
  constructor(
    @Inject(DELETE_SECRET_SERVICE)
    private readonly deleteSecretService: IDeleteSecretService,
  ) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a secret' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteSecretService.execute(id);
  }
}
