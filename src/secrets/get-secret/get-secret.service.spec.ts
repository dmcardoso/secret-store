import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { GetSecretService } from './get-secret.service';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema } from '../entities/secret.entity';

describe('GetSecretService', () => {
  let service: GetSecretService;
  let mockRepo: { findOne: jest.Mock };
  let mockEncryption: { decrypt: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'test-uuid',
        username: 'user1',
        website: 'example.com',
        secretName: 'My Secret',
        encryptedPassword: 'iv:ciphertext',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    mockEncryption = {
      decrypt: jest.fn().mockReturnValue('decrypted-password'),
    };

    const module = await Test.createTestingModule({
      providers: [
        GetSecretService,
        { provide: getRepositoryToken(SecretSchema), useValue: mockRepo },
        { provide: EncryptionService, useValue: mockEncryption },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), setContext: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GetSecretService);
  });

  it('should return a secret by id', async () => {
    const result = await service.execute('test-uuid');
    expect(result.id).toBe('test-uuid');
    expect(result.password).toBe('decrypted-password');
  });

  it('should throw NotFoundException when secret not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.execute('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
