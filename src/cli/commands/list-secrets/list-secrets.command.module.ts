import { Module } from '@nestjs/common';
import { ListSecretsModule } from '../../../secrets/list-secrets/list-secrets.module';
import { ListSecretsCommand } from './list-secrets.command';

@Module({
  imports: [ListSecretsModule],
  providers: [ListSecretsCommand],
})
export class ListSecretsCommandModule {}
