import { Module } from '@nestjs/common';
import { GENERATE_PASSWORD_SERVICE } from '../domain/generate-password.service.interface';
import { GeneratePasswordService } from './generate-password.service';
import { GeneratePasswordController } from './generate-password.controller';

@Module({
  controllers: [GeneratePasswordController],
  providers: [
    { provide: GENERATE_PASSWORD_SERVICE, useClass: GeneratePasswordService },
  ],
  exports: [GENERATE_PASSWORD_SERVICE],
})
export class GeneratePasswordModule {}
