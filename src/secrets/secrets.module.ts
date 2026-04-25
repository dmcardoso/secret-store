import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SecretSchema } from './entities/secret.entity';
import { SecretRepository } from './repositories/secret.repository';
import { CreateSecretService } from './services/create-secret.service';
import { ListSecretsService } from './services/list-secrets.service';
import { GetSecretService } from './services/get-secret.service';
import { UpdateSecretService } from './services/update-secret.service';
import { DeleteSecretService } from './services/delete-secret.service';
import { GeneratePasswordService } from './services/generate-password.service';
import { CREATE_SECRET_SERVICE } from './domain/create-secret.service.interface';
import { DELETE_SECRET_SERVICE } from './domain/delete-secret.service.interface';
import { GENERATE_PASSWORD_SERVICE } from './domain/generate-password.service.interface';
import { GET_SECRET_SERVICE } from './domain/get-secret.service.interface';
import { LIST_SECRETS_SERVICE } from './domain/list-secrets.service.interface';
import { UPDATE_SECRET_SERVICE } from './domain/update-secret.service.interface';
import { CreateSecretController } from './controllers/create-secret.controller';
import { ListSecretsController } from './controllers/list-secrets.controller';
import { GetSecretController } from './controllers/get-secret.controller';
import { UpdateSecretController } from './controllers/update-secret.controller';
import { DeleteSecretController } from './controllers/delete-secret.controller';
import { GeneratePasswordController } from './controllers/generate-password.controller';

@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema])],
  controllers: [
    CreateSecretController,
    ListSecretsController,
    GetSecretController,
    UpdateSecretController,
    DeleteSecretController,
    GeneratePasswordController,
  ],
  providers: [
    { provide: CREATE_SECRET_SERVICE, useClass: CreateSecretService },
    { provide: LIST_SECRETS_SERVICE, useClass: ListSecretsService },
    { provide: GET_SECRET_SERVICE, useClass: GetSecretService },
    { provide: UPDATE_SECRET_SERVICE, useClass: UpdateSecretService },
    { provide: DELETE_SECRET_SERVICE, useClass: DeleteSecretService },
    { provide: GENERATE_PASSWORD_SERVICE, useClass: GeneratePasswordService },
    SecretRepository,
  ],
  exports: [GENERATE_PASSWORD_SERVICE],
})
export class SecretsModule {}
