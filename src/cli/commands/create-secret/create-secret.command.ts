import { Command, CommandRunner, Option } from 'nest-commander';
import { Inject } from '@nestjs/common';
import { CREATE_SECRET_SERVICE } from '../../../secrets/domain/create-secret.service.interface';
import type { ICreateSecretService } from '../../../secrets/domain/create-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';
import type { CreateSecretOptions } from './create-secret-options.dto';
import { outputSecret } from '../../utils/output.util';

@Command({
  name: 'create-secret',
  description: 'Create a new secret',
})
export class CreateSecretCommand extends CommandRunner {
  constructor(
    @Inject(CREATE_SECRET_SERVICE)
    private readonly createSecretService: ICreateSecretService,
    private readonly logService: LoggerService,
  ) {
    super();
    this.logService.setContext(CreateSecretCommand.name);
  }

  async run(
    _passedParam: string[],
    options?: CreateSecretOptions,
  ): Promise<void> {
    if (
      !options?.username ||
      !options?.website ||
      !options?.secretName ||
      !options?.password
    ) {
      throw new Error(
        'All fields are required: --username, --website, --secret-name, --password',
      );
    }

    const result = await this.createSecretService.execute({
      username: options.username,
      website: options.website,
      secretName: options.secretName,
      password: options.password,
    });

    outputSecret(result, options.json ?? false);
  }

  @Option({
    flags: '-u, --username <username>',
    description: 'Username for the secret',
  })
  parseUsername(value: string): string {
    return value;
  }

  @Option({
    flags: '-w, --website <website>',
    description: 'Website for the secret',
  })
  parseWebsite(value: string): string {
    return value;
  }

  @Option({
    flags: '-s, --secret-name <secretName>',
    description: 'Name for the secret',
  })
  parseSecretName(value: string): string {
    return value;
  }

  @Option({
    flags: '-p, --password <password>',
    description: 'Password for the secret',
  })
  parsePassword(value: string): string {
    return value;
  }

  @Option({
    flags: '-j, --json',
    description: 'Output as JSON',
  })
  parseJson(): boolean {
    return true;
  }
}
