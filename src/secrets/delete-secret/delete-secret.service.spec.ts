import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { DeleteSecretService } from './delete-secret.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { SecretSchema } from '../entities/secret.entity';

describe('DeleteSecretService', () => {
  let service: DeleteSecretService;
  let mockRepo: {
    findOne: jest.Mock;
    getEntityManager: jest.Mock;
  };

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'test-uuid',
        username: 'user1',
        website: 'example.com',
        secretName: 'My Secret',
        encryptedPassword: 'iv:ciphertext',
      }),
      getEntityManager: jest.fn().mockReturnValue({
        remove: jest.fn().mockReturnThis(),
        flush: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        DeleteSecretService,
        { provide: getRepositoryToken(SecretSchema), useValue: mockRepo },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), setContext: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(DeleteSecretService);
  });

  it('should delete a secret', async () => {
    await expect(service.execute('test-uuid')).resolves.toBeUndefined();
  });

  it('should throw NotFoundException when secret not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.execute('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
