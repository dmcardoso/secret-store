import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EncryptionModule } from '../../shared/encryption/encryption.module';
import { SecretSchema } from '../entities/secret.entity';
import { UPDATE_SECRET_SERVICE } from '../domain/update-secret.service.interface';
import { UpdateSecretService } from './update-secret.service';
import { UpdateSecretController } from './update-secret.controller';

@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema]), EncryptionModule],
  controllers: [UpdateSecretController],
  providers: [
    { provide: UPDATE_SECRET_SERVICE, useClass: UpdateSecretService },
  ],
  exports: [UPDATE_SECRET_SERVICE],
})
export class UpdateSecretModule {}
