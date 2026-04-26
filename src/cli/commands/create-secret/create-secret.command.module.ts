import { Module } from '@nestjs/common';
import { CreateSecretModule } from '../../../secrets/create-secret/create-secret.module';
import { CreateSecretCommand } from './create-secret.command';

@Module({
  imports: [CreateSecretModule],
  providers: [CreateSecretCommand],
})
export class CreateSecretCommandModule {}
