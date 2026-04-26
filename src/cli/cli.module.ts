import { Module } from '@nestjs/common';
import { CliConfigModule } from './config/cli-config.module';
import { SharedModule } from '../shared/shared.module';
import { GeneratePasswordCommandModule } from './commands/generate-password/generate-password.command.module';
import { CreateSecretCommandModule } from './commands/create-secret/create-secret.command.module';
import { ListSecretsCommandModule } from './commands/list-secrets/list-secrets.command.module';
import { GetSecretCommandModule } from './commands/get-secret/get-secret.command.module';
import { UpdateSecretCommandModule } from './commands/update-secret/update-secret.command.module';
import { DeleteSecretCommandModule } from './commands/delete-secret/delete-secret.command.module';

@Module({
  imports: [
    CliConfigModule,
    SharedModule,
    GeneratePasswordCommandModule,
    CreateSecretCommandModule,
    ListSecretsCommandModule,
    GetSecretCommandModule,
    UpdateSecretCommandModule,
    DeleteSecretCommandModule,
  ],
})
export class CliModule {}
