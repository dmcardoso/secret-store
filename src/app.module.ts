import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { SharedModule } from './shared/shared.module';
import { SecretsModule } from './secrets/secrets.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, DatabaseModule, SharedModule, SecretsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
