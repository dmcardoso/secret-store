import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LIST_SECRETS_SERVICE } from '../domain/list-secrets.service.interface';
import type { IListSecretsService } from '../domain/list-secrets.service.interface';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class ListSecretsController {
  constructor(
    @Inject(LIST_SECRETS_SERVICE)
    private readonly listSecretsService: IListSecretsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all secrets with pagination' })
  async list(@Query() pagination: PaginationDto) {
    return this.listSecretsService.execute(pagination);
  }
}
