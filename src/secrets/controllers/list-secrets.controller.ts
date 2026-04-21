import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ListSecretsService } from '../services/list-secrets.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class ListSecretsController {
  constructor(private readonly listSecretsService: ListSecretsService) {}

  @Get()
  @ApiOperation({ summary: 'List all secrets with pagination' })
  async list(@Query() pagination: PaginationDto) {
    return this.listSecretsService.execute(pagination);
  }
}
