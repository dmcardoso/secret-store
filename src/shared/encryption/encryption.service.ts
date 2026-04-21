import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('encryption.key', '');
    this.key = Buffer.from(key, 'utf-8');
  }

  onModuleInit() {
    if (this.key.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be exactly 32 characters. ' +
          `Got ${this.key.length} characters.`,
      );
    }
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf-8'),
      cipher.final(),
    ]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, dataHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf-8');
  }
}
