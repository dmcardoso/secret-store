import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretRepository } from '../repositories/secret.repository';
import { SecretResponseDto } from '../dto/secret-response.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IListSecretsService } from '../domain/list-secrets.service.interface';

@Injectable()
export class ListSecretsService implements IListSecretsService {
  constructor(
    private readonly secretRepo: SecretRepository,
    private readonly encryptionService: EncryptionService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ListSecretsService.name);
  }

  async execute(pagination: PaginationDto) {
    const [secrets, total] = await this.secretRepo.findPaginated(
      pagination.page,
      pagination.limit,
    );
    this.logger.log(`Listed ${secrets.length} secrets`);
    const data: SecretResponseDto[] = secrets.map((secret) => ({
      id: secret.id,
      username: secret.username,
      website: secret.website,
      secretName: secret.secretName,
      password: this.encryptionService.decrypt(secret.encryptedPassword),
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    }));
    return { data, total, page: pagination.page, limit: pagination.limit };
  }
}
