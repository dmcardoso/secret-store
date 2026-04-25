import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EncryptionModule } from '../../shared/encryption/encryption.module';
import { SecretSchema } from '../entities/secret.entity';
import { GET_SECRET_SERVICE } from '../domain/get-secret.service.interface';
import { GetSecretService } from './get-secret.service';
import { GetSecretController } from './get-secret.controller';

@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema]), EncryptionModule],
  controllers: [GetSecretController],
  providers: [{ provide: GET_SECRET_SERVICE, useClass: GetSecretService }],
})
export class GetSecretModule {}
