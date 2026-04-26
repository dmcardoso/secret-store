import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema } from '../entities/secret.entity';
import { SecretRepository } from '../repositories/secret.repository';
import { SecretResponseDto } from '../dto/secret-response.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IListSecretsService } from '../domain/list-secrets.service.interface';
import { SecretMapper } from '../mappers/secret.mapper';

@Injectable()
export class ListSecretsService implements IListSecretsService {
  constructor(
    @InjectRepository(SecretSchema)
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
    const data: SecretResponseDto[] = secrets.map((secret) =>
      SecretMapper.toResponseDto(
        secret,
        this.encryptionService.decrypt(secret.encryptedPassword),
      ),
    );
    return { data, total, page: pagination.page, limit: pagination.limit };
  }
}
