import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema, type Secret } from '../entities/secret.entity';
import { IDeleteSecretService } from '../domain/delete-secret.service.interface';

@Injectable()
export class DeleteSecretService implements IDeleteSecretService {
  constructor(
    @InjectRepository(SecretSchema)
    private readonly repo: EntityRepository<Secret>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteSecretService.name);
  }

  async execute(id: string): Promise<void> {
    const secret = await this.repo.findOne({ id });
    if (!secret) {
      throw new NotFoundException(`Secret with id ${id} not found`);
    }
    await this.repo.getEntityManager().remove(secret).flush();
    this.logger.log(`Deleted secret ${id}`);
  }
}
