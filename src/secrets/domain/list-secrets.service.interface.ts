import { PaginationDto } from '../../shared/dto/pagination.dto';
import type { SecretResponseDto } from '../dto/secret-response.dto';

export const LIST_SECRETS_SERVICE = Symbol('LIST_SECRETS_SERVICE');

export interface IListSecretsService {
  execute(pagination: PaginationDto): Promise<{
    data: SecretResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;
}
