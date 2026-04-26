import { Command } from 'nest-commander';
import { Inject } from '@nestjs/common';
import { DELETE_SECRET_SERVICE } from '../../../secrets/domain/delete-secret.service.interface';
import type { IDeleteSecretService } from '../../../secrets/domain/delete-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';
import type { DeleteSecretOptions } from './delete-secret-options.dto';
import { outputSuccess } from '../../utils/output.util';
import { BaseCommand } from '../base.command';

@Command({
  name: 'delete-secret',
  description: 'Delete a secret',
})
export class DeleteSecretCommand extends BaseCommand {
  constructor(
    @Inject(DELETE_SECRET_SERVICE)
    private readonly deleteSecretService: IDeleteSecretService,
    private readonly logService: LoggerService,
  ) {
    super();
    this.logService.setContext(DeleteSecretCommand.name);
  }

  async run(
    passedParam: string[],
    options?: DeleteSecretOptions,
  ): Promise<void> {
    const id = passedParam[0];
    if (!id) {
      throw new Error('Secret ID is required: delete-secret <id>');
    }

    await this.deleteSecretService.execute(id);
    outputSuccess('Secret deleted successfully', options?.json ?? false, {
      id,
    });
  }
}
