import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { UpdateSecretService } from './update-secret.service';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema } from '../entities/secret.entity';

describe('UpdateSecretService', () => {
  let service: UpdateSecretService;
  let mockRepo: {
    findOne: jest.Mock;
    getEntityManager: jest.Mock;
  };
  let mockEncryption: { encrypt: jest.Mock; decrypt: jest.Mock };

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
      findOne: jest.fn().mockResolvedValue({ ...mockSecret }),
      getEntityManager: jest.fn().mockReturnValue({
        flush: jest.fn().mockResolvedValue(undefined),
      }),
    };

    mockEncryption = {
      encrypt: jest.fn().mockReturnValue('new:encrypted'),
      decrypt: jest.fn().mockReturnValue('decrypted-password'),
    };

    const module = await Test.createTestingModule({
      providers: [
        UpdateSecretService,
        { provide: getRepositoryToken(SecretSchema), useValue: mockRepo },
        { provide: EncryptionService, useValue: mockEncryption },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), setContext: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UpdateSecretService);
  });

  it('should update username and return updated secret', async () => {
    const result = await service.execute('test-uuid', { username: 'newuser' });
    expect(result.username).toBe('newuser');
  });

  it('should re-encrypt when password is provided', async () => {
    await service.execute('test-uuid', { password: 'new-password' });
    expect(mockEncryption.encrypt).toHaveBeenCalledWith('new-password');
  });

  it('should throw NotFoundException when secret not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(
      service.execute('missing-id', { username: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });
});
