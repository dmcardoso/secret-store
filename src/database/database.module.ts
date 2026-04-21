import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import type { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import type { IDatabaseDriver } from '@mikro-orm/core';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): MikroOrmModuleOptions<IDatabaseDriver> => ({
        driver: PostgreSqlDriver,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        dbName: configService.get<string>('database.name'),
        user: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        autoLoadEntities: true,
        debug: configService.get<string>('node.env') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
