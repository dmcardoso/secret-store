import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { ListSecretsService } from './list-secrets.service';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema } from '../entities/secret.entity';

describe('ListSecretsService', () => {
  let service: ListSecretsService;
  let mockRepo: { findPaginated: jest.Mock };
  let mockEncryption: { decrypt: jest.Mock };

  const mockSecret = {
    id: 'test-uuid',
    username: 'user1',
    website: 'example.com',
    secretName: 'My Secret',
    encryptedPassword: 'iv:ciphertext',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepo = {
      findPaginated: jest.fn().mockResolvedValue([[mockSecret], 1]),
    };

    mockEncryption = {
      decrypt: jest.fn().mockReturnValue('decrypted-password'),
    };

    const module = await Test.createTestingModule({
      providers: [
        ListSecretsService,
        { provide: getRepositoryToken(SecretSchema), useValue: mockRepo },
        { provide: EncryptionService, useValue: mockEncryption },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), setContext: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ListSecretsService);
  });

  it('should return paginated secrets with decrypted passwords', async () => {
    const result = await service.execute({ page: 1, limit: 10 });
    expect(mockRepo.findPaginated).toHaveBeenCalledWith(1, 10);
    expect(result.total).toBe(1);
    expect(result.data[0].password).toBe('decrypted-password');
  });
});
