import { EntityRepository } from '@mikro-orm/core';
import type { Secret } from '../entities/secret.entity';

export class SecretRepository extends EntityRepository<Secret> {
  async findPaginated(page: number, limit: number) {
    return this.findAndCount(
      {},
      {
        offset: (page - 1) * limit,
        limit,
        orderBy: { createdAt: 'desc' },
      },
    );
  }
}
