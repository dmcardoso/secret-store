import { PaginationDto } from '../../shared/dto/pagination.dto';

export const LIST_SECRETS_SERVICE = Symbol('LIST_SECRETS_SERVICE');

export interface IListSecretsService {
  execute(pagination: PaginationDto): Promise<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }>;
}
