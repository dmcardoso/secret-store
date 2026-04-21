import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    const configService = {
      get: (key: string, defaultValue?: string) => {
        if (key === 'encryption.key') return 'a'.repeat(32);
        return defaultValue ?? '';
      },
    } as Partial<ConfigService>;
    service = new EncryptionService(configService as ConfigService);
    service.onModuleInit();
  });

  describe('encrypt', () => {
    it('should return a string in iv:ciphertext format', () => {
      const result = service.encrypt('my-password');
      expect(result).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/);
    });

    it('should produce different ciphertexts for the same plaintext', () => {
      const a = service.encrypt('same-input');
      const b = service.encrypt('same-input');
      expect(a).not.toBe(b);
    });
  });

  describe('decrypt', () => {
    it('should round-trip encrypt then decrypt', () => {
      const plaintext = 'my-super-secret-password';
      const encrypted = service.encrypt(plaintext);
      expect(service.decrypt(encrypted)).toBe(plaintext);
    });
  });

  describe('onModuleInit', () => {
    it('should throw if key is not 32 characters', () => {
      const badConfig = {
        get: (key: string, defaultValue?: string) => {
          if (key === 'encryption.key') return 'too-short';
          return defaultValue ?? '';
        },
      } as Partial<ConfigService>;
      const badService = new EncryptionService(badConfig as ConfigService);
      expect(() => badService.onModuleInit()).toThrow(
        'ENCRYPTION_KEY must be exactly 32 characters',
      );
    });
  });
});
