import { Module } from '@nestjs/common';
import { DeleteSecretModule } from '../../../secrets/delete-secret/delete-secret.module';
import { DeleteSecretCommand } from './delete-secret.command';

@Module({
  imports: [DeleteSecretModule],
  providers: [DeleteSecretCommand],
})
export class DeleteSecretCommandModule {}
