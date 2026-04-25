import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SecretSchema } from '../entities/secret.entity';
import { DELETE_SECRET_SERVICE } from '../domain/delete-secret.service.interface';
import { DeleteSecretService } from './delete-secret.service';
import { DeleteSecretController } from './delete-secret.controller';

@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema])],
  controllers: [DeleteSecretController],
  providers: [
    { provide: DELETE_SECRET_SERVICE, useClass: DeleteSecretService },
  ],
})
export class DeleteSecretModule {}
