import { SecretResponseDto } from '../dto/secret-response.dto';

export const GET_SECRET_SERVICE = Symbol('GET_SECRET_SERVICE');

export interface IGetSecretService {
  execute(id: string): Promise<SecretResponseDto>;
}
