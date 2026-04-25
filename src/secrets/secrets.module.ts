import { Module } from '@nestjs/common';
import { CreateSecretModule } from './create-secret/create-secret.module';
import { ListSecretsModule } from './list-secrets/list-secrets.module';
import { GetSecretModule } from './get-secret/get-secret.module';
import { UpdateSecretModule } from './update-secret/update-secret.module';
import { DeleteSecretModule } from './delete-secret/delete-secret.module';
import { GeneratePasswordModule } from './generate-password/generate-password.module';

@Module({
  imports: [
    CreateSecretModule,
    ListSecretsModule,
    GetSecretModule,
    UpdateSecretModule,
    DeleteSecretModule,
    GeneratePasswordModule,
  ],
})
export class SecretsModule {}
