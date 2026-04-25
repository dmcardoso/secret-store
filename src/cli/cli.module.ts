import { Module } from '@nestjs/common';
import { CliConfigModule } from './config/cli-config.module';
import { DatabaseModule } from '../database/database.module';
import { SharedModule } from '../shared/shared.module';
import { GeneratePasswordModule } from '../secrets/generate-password/generate-password.module';
import { GeneratePasswordCommand } from './commands/generate-password/generate-password.command';

@Module({
  imports: [
    CliConfigModule,
    DatabaseModule,
    SharedModule,
    GeneratePasswordModule,
  ],
  providers: [GeneratePasswordCommand],
})
export class CliModule {}
