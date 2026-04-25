import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { CreateSecretService } from './create-secret.service';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema } from '../entities/secret.entity';

describe('CreateSecretService', () => {
  let service: CreateSecretService;
  let mockRepo: {
    create: jest.Mock;
    getEntityManager: jest.Mock;
  };
  let mockEncryption: { encrypt: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue({
        id: 'test-uuid',
        username: 'user1',
        website: 'example.com',
        secretName: 'My Secret',
        encryptedPassword: 'enc:pass',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      getEntityManager: jest.fn().mockReturnValue({
        persist: jest.fn().mockReturnThis(),
        flush: jest.fn().mockResolvedValue(undefined),
      }),
    };

    mockEncryption = {
      encrypt: jest.fn().mockReturnValue('enc:pass'),
    };

    const module = await Test.createTestingModule({
      providers: [
        CreateSecretService,
        { provide: getRepositoryToken(SecretSchema), useValue: mockRepo },
        { provide: EncryptionService, useValue: mockEncryption },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), setContext: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CreateSecretService);
  });

  it('should create a secret and return response DTO', async () => {
    const dto = {
      username: 'user1',
      website: 'example.com',
      secretName: 'My Secret',
      password: 'my-password',
    };
    const result = await service.execute(dto);
    expect(mockEncryption.encrypt).toHaveBeenCalledWith('my-password');
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ encryptedPassword: 'enc:pass' }),
    );
    expect(result.username).toBe('user1');
    expect(result.password).toBe('my-password');
  });
});
