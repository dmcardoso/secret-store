import { Module } from '@nestjs/common';
import { CliConfigModule } from './config/cli-config.module';
import { SharedModule } from '../shared/shared.module';
import { GeneratePasswordCommandModule } from './commands/generate-password/generate-password.command.module';

@Module({
  imports: [CliConfigModule, SharedModule, GeneratePasswordCommandModule],
})
export class CliModule {}
