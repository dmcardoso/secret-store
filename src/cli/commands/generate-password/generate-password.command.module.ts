import { Module } from '@nestjs/common';
import { GeneratePasswordModule } from '../../../secrets/generate-password/generate-password.module';
import { GeneratePasswordCommand } from './generate-password.command';

@Module({
  imports: [GeneratePasswordModule],
  providers: [GeneratePasswordCommand],
})
export class GeneratePasswordCommandModule {}
