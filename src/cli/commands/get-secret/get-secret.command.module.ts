import { Module } from '@nestjs/common';
import { GetSecretModule } from '../../../secrets/get-secret/get-secret.module';
import { GetSecretCommand } from './get-secret.command';

@Module({
  imports: [GetSecretModule],
  providers: [GetSecretCommand],
})
export class GetSecretCommandModule {}
