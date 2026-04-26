import { Command, Option } from 'nest-commander';
import { Inject } from '@nestjs/common';
import { UPDATE_SECRET_SERVICE } from '../../../secrets/domain/update-secret.service.interface';
import type { IUpdateSecretService } from '../../../secrets/domain/update-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';
import type { UpdateSecretOptions } from './update-secret-options.dto';
import { outputSecret } from '../../utils/output.util';
import { BaseCommand } from '../base.command';

@Command({
  name: 'update-secret',
  description: 'Update a secret',
})
export class UpdateSecretCommand extends BaseCommand {
  constructor(
    @Inject(UPDATE_SECRET_SERVICE)
    private readonly updateSecretService: IUpdateSecretService,
    private readonly logService: LoggerService,
  ) {
    super();
    this.logService.setContext(UpdateSecretCommand.name);
  }

  async run(
    passedParam: string[],
    options?: UpdateSecretOptions,
  ): Promise<void> {
    const id = passedParam[0];
    if (!id) {
      throw new Error('Secret ID is required: update-secret <id>');
    }

    if (
      !options?.username &&
      !options?.website &&
      !options?.secretName &&
      !options?.password
    ) {
      throw new Error(
        'At least one field is required: --username, --website, --secret-name, --password',
      );
    }

    const dto: Record<string, string> = {};
    if (options.username) dto.username = options.username;
    if (options.website) dto.website = options.website;
    if (options.secretName) dto.secretName = options.secretName;
    if (options.password) dto.password = options.password;

    const result = await this.updateSecretService.execute(id, dto);
    outputSecret(result, options.json ?? false);
  }

  @Option({
    flags: '-u, --username <username>',
    description: 'New username',
  })
  parseUsername(value: string): string {
    return value;
  }

  @Option({
    flags: '-w, --website <website>',
    description: 'New website',
  })
  parseWebsite(value: string): string {
    return value;
  }

  @Option({
    flags: '-s, --secret-name <secretName>',
    description: 'New secret name',
  })
  parseSecretName(value: string): string {
    return value;
  }

  @Option({
    flags: '-p, --password <password>',
    description: 'New password',
  })
  parsePassword(value: string): string {
    return value;
  }
}
