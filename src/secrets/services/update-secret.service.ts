import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema, type Secret } from '../entities/secret.entity';
import { UpdateSecretDto } from '../dto/update-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';
import { IUpdateSecretService } from '../domain/update-secret.service.interface';

@Injectable()
export class UpdateSecretService implements IUpdateSecretService {
  constructor(
    @InjectRepository(SecretSchema)
    private readonly repo: EntityRepository<Secret>,
    private readonly encryptionService: EncryptionService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdateSecretService.name);
  }

  async execute(id: string, dto: UpdateSecretDto): Promise<SecretResponseDto> {
    const secret = await this.repo.findOne({ id });
    if (!secret) {
      throw new NotFoundException(`Secret with id ${id} not found`);
    }

    if (dto.username !== undefined) secret.username = dto.username;
    if (dto.website !== undefined) secret.website = dto.website;
    if (dto.secretName !== undefined) secret.secretName = dto.secretName;
    if (dto.password !== undefined) {
      secret.encryptedPassword = this.encryptionService.encrypt(dto.password);
    }

    await this.repo.getEntityManager().flush();
    this.logger.log(`Updated secret ${id}`);
    return {
      id: secret.id,
      username: secret.username,
      website: secret.website,
      secretName: secret.secretName,
      password: dto.password
        ? dto.password
        : this.encryptionService.decrypt(secret.encryptedPassword),
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  }
}
