import { Global, Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { EncryptionModule } from './encryption/encryption.module';

@Global()
@Module({
  imports: [LoggerModule, EncryptionModule],
  exports: [LoggerModule, EncryptionModule],
})
export class SharedModule {}
