import { CreateSecretDto } from '../dto/create-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';

export const CREATE_SECRET_SERVICE = Symbol('CREATE_SECRET_SERVICE');

export interface ICreateSecretService {
  execute(dto: CreateSecretDto): Promise<SecretResponseDto>;
}
