import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EncryptionModule } from '../../shared/encryption/encryption.module';
import { SecretSchema } from '../entities/secret.entity';
import { LIST_SECRETS_SERVICE } from '../domain/list-secrets.service.interface';
import { ListSecretsService } from './list-secrets.service';
import { ListSecretsController } from './list-secrets.controller';

@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema]), EncryptionModule],
  controllers: [ListSecretsController],
  providers: [{ provide: LIST_SECRETS_SERVICE, useClass: ListSecretsService }],
})
export class ListSecretsModule {}
