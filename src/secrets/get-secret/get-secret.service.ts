import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema, type Secret } from '../entities/secret.entity';
import { SecretResponseDto } from '../dto/secret-response.dto';
import { IGetSecretService } from '../domain/get-secret.service.interface';
import { SecretMapper } from '../mappers/secret.mapper';

@Injectable()
export class GetSecretService implements IGetSecretService {
  constructor(
    @InjectRepository(SecretSchema)
    private readonly repo: EntityRepository<Secret>,
    private readonly encryptionService: EncryptionService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetSecretService.name);
  }

  async execute(id: string): Promise<SecretResponseDto> {
    const secret = await this.repo.findOne({ id });
    if (!secret) {
      throw new NotFoundException(`Secret with id ${id} not found`);
    }
    this.logger.log(`Retrieved secret ${id}`);
    return SecretMapper.toResponseDto(
      secret,
      this.encryptionService.decrypt(secret.encryptedPassword),
    );
  }
}
