import { Command, CommandRunner, Option } from 'nest-commander';
import { Inject } from '@nestjs/common';
import { GET_SECRET_SERVICE } from '../../../secrets/domain/get-secret.service.interface';
import type { IGetSecretService } from '../../../secrets/domain/get-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';
import type { GetSecretOptions } from './get-secret-options.dto';
import { outputSecret } from '../../utils/output.util';

@Command({
  name: 'get-secret',
  description: 'Get a secret by ID',
})
export class GetSecretCommand extends CommandRunner {
  constructor(
    @Inject(GET_SECRET_SERVICE)
    private readonly getSecretService: IGetSecretService,
    private readonly logService: LoggerService,
  ) {
    super();
    this.logService.setContext(GetSecretCommand.name);
  }

  async run(passedParam: string[], options?: GetSecretOptions): Promise<void> {
    const id = passedParam[0];
    if (!id) {
      throw new Error('Secret ID is required: get-secret <id>');
    }

    const result = await this.getSecretService.execute(id);
    outputSecret(result, options?.json ?? false);
  }

  @Option({
    flags: '-j, --json',
    description: 'Output as JSON',
  })
  parseJson(): boolean {
    return true;
  }
}
