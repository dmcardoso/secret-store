import { CommandRunner, Option } from 'nest-commander';

export abstract class BaseCommand extends CommandRunner {
  @Option({
    flags: '-j, --json',
    description: 'Output as JSON',
  })
  parseJson(): boolean {
    return true;
  }
}
