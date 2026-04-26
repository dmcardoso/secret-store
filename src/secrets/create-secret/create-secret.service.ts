import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema, type Secret } from '../entities/secret.entity';
import { CreateSecretDto } from '../dto/create-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';
import { ICreateSecretService } from '../domain/create-secret.service.interface';
import { SecretMapper } from '../mappers/secret.mapper';

@Injectable()
export class CreateSecretService implements ICreateSecretService {
  constructor(
    @InjectRepository(SecretSchema)
    private readonly repo: EntityRepository<Secret>,
    private readonly encryptionService: EncryptionService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreateSecretService.name);
  }

  async execute(dto: CreateSecretDto): Promise<SecretResponseDto> {
    const encryptedPassword = this.encryptionService.encrypt(dto.password);
    const secret = this.repo.create({
      username: dto.username,
      website: dto.website,
      secretName: dto.secretName,
      encryptedPassword,
    });
    await this.repo.getEntityManager().persist(secret).flush();
    this.logger.log(`Secret created with id ${secret.id}`);
    return SecretMapper.toResponseDto(secret, dto.password);
  }
}
