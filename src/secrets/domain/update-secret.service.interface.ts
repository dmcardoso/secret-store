import { UpdateSecretDto } from '../dto/update-secret.dto';
import { SecretResponseDto } from '../dto/secret-response.dto';

export const UPDATE_SECRET_SERVICE = Symbol('UPDATE_SECRET_SERVICE');

export interface IUpdateSecretService {
  execute(id: string, dto: UpdateSecretDto): Promise<SecretResponseDto>;
}
