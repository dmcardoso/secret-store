import { Module } from '@nestjs/common';
import { CliConfigModule } from './config/cli-config.module';
import { DatabaseModule } from '../database/database.module';
import { SharedModule } from '../shared/shared.module';
import { SecretsModule } from '../secrets/secrets.module';
import { GeneratePasswordCommand } from './commands/generate-password/generate-password.command';

@Module({
  imports: [CliConfigModule, DatabaseModule, SharedModule, SecretsModule],
  providers: [GeneratePasswordCommand],
})
export class CliModule {}
