import { Command, CommandRunner, Option } from 'nest-commander';
import { Inject } from '@nestjs/common';
import { LIST_SECRETS_SERVICE } from '../../../secrets/domain/list-secrets.service.interface';
import type { IListSecretsService } from '../../../secrets/domain/list-secrets.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';
import type { ListSecretsOptions } from './list-secrets-options.dto';
import { outputSecretList } from '../../utils/output.util';
import type { SecretResponseDto } from '../../../secrets/dto/secret-response.dto';

@Command({
  name: 'list-secrets',
  description: 'List all secrets',
})
export class ListSecretsCommand extends CommandRunner {
  constructor(
    @Inject(LIST_SECRETS_SERVICE)
    private readonly listSecretsService: IListSecretsService,
    private readonly logService: LoggerService,
  ) {
    super();
    this.logService.setContext(ListSecretsCommand.name);
  }

  async run(
    _passedParam: string[],
    options?: ListSecretsOptions,
  ): Promise<void> {
    const result = await this.listSecretsService.execute({
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
    });

    outputSecretList(
      { ...result, data: result.data as SecretResponseDto[] },
      options?.json ?? false,
    );
  }

  @Option({
    flags: '-p, --page <number>',
    description: 'Page number (default: 1)',
    defaultValue: 1,
  })
  parsePage(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new Error('Page must be a positive integer');
    }
    return parsed;
  }

  @Option({
    flags: '-l, --limit <number>',
    description: 'Items per page (default: 10, max: 100)',
    defaultValue: 10,
  })
  parseLimit(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new Error('Limit must be a positive integer');
    }
    if (parsed > 100) {
      throw new Error('Limit must not exceed 100');
    }
    return parsed;
  }

  @Option({
    flags: '-j, --json',
    description: 'Output as JSON',
  })
  parseJson(): boolean {
    return true;
  }
}
