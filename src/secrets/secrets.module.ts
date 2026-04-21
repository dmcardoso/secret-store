import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SecretSchema } from './entities/secret.entity';
import { SecretRepository } from './repositories/secret.repository';
import { CreateSecretService } from './services/create-secret.service';
import { ListSecretsService } from './services/list-secrets.service';
import { GetSecretService } from './services/get-secret.service';
import { UpdateSecretService } from './services/update-secret.service';
import { DeleteSecretService } from './services/delete-secret.service';
import { CreateSecretController } from './controllers/create-secret.controller';
import { ListSecretsController } from './controllers/list-secrets.controller';
import { GetSecretController } from './controllers/get-secret.controller';
import { UpdateSecretController } from './controllers/update-secret.controller';
import { DeleteSecretController } from './controllers/delete-secret.controller';

@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema])],
  controllers: [
    CreateSecretController,
    ListSecretsController,
    GetSecretController,
    UpdateSecretController,
    DeleteSecretController,
  ],
  providers: [
    CreateSecretService,
    ListSecretsService,
    GetSecretService,
    UpdateSecretService,
    DeleteSecretService,
    SecretRepository,
  ],
})
export class SecretsModule {}
