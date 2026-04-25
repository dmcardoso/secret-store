import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { cliValidationSchema } from './cli-env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: cliValidationSchema,
      cache: true,
    }),
  ],
})
export class CliConfigModule {}
