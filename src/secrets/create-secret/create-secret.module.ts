import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EncryptionModule } from '../../shared/encryption/encryption.module';
import { SecretSchema } from '../entities/secret.entity';
import { CREATE_SECRET_SERVICE } from '../domain/create-secret.service.interface';
import { CreateSecretService } from './create-secret.service';
import { CreateSecretController } from './create-secret.controller';

@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema]), EncryptionModule],
  controllers: [CreateSecretController],
  providers: [
    { provide: CREATE_SECRET_SERVICE, useClass: CreateSecretService },
  ],
})
export class CreateSecretModule {}
