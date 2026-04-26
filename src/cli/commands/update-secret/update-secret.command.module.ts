import { Module } from '@nestjs/common';
import { UpdateSecretModule } from '../../../secrets/update-secret/update-secret.module';
import { UpdateSecretCommand } from './update-secret.command';

@Module({
  imports: [UpdateSecretModule],
  providers: [UpdateSecretCommand],
})
export class UpdateSecretCommandModule {}
