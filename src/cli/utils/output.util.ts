import type { SecretResponseDto } from '../../secrets/dto/secret-response.dto';

export function outputSecret(secret: SecretResponseDto, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(secret, null, 2));
    return;
  }
  console.table([secret]);
}

export function outputSecretList(
  result: {
    data: SecretResponseDto[];
    total: number;
    page: number;
    limit: number;
  },
  json: boolean,
): void {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.table(result.data);
  const totalPages = Math.ceil(result.total / result.limit);
  console.log(`Page ${result.page} of ${totalPages} (${result.total} total)`);
}

export function outputSuccess(
  message: string,
  json: boolean,
  data?: Record<string, unknown>,
): void {
  if (json) {
    console.log(JSON.stringify({ success: true, ...data }, null, 2));
    return;
  }
  console.log(message);
}
