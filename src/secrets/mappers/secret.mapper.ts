import type { Secret } from '../entities/secret.entity';
import type { SecretResponseDto } from '../dto/secret-response.dto';

export class SecretMapper {
  static toResponseDto(
    secret: Secret,
    decryptedPassword: string,
  ): SecretResponseDto {
    return {
      id: secret.id,
      username: secret.username,
      website: secret.website,
      secretName: secret.secretName,
      password: decryptedPassword,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    };
  }
}
