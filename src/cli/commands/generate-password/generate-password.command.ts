import { Command, CommandRunner, Option } from 'nest-commander';
import { Inject } from '@nestjs/common';
import { GENERATE_PASSWORD_SERVICE } from '../../../secrets/domain/generate-password.service.interface';
import type { IGeneratePasswordService } from '../../../secrets/domain/generate-password.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';
import type { GeneratePasswordOptions } from './generate-password-options.dto';

@Command({
  name: 'generate-password',
  description: 'Generate a random password',
})
export class GeneratePasswordCommand extends CommandRunner {
  constructor(
    @Inject(GENERATE_PASSWORD_SERVICE)
    private readonly generatePasswordService: IGeneratePasswordService,
    private readonly logService: LoggerService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options?: GeneratePasswordOptions,
  ): Promise<void> {
    const result = this.generatePasswordService.execute({
      length: options?.length,
    });
    this.logService.log(`Your password is: ${result.password}`);
  }

  @Option({
    flags: '-l, --length <number>',
    description: 'Password length (default: 16)',
    defaultValue: 16,
  })
  parseLength(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new Error('Length must be a positive integer');
    }
    return parsed;
  }
}
