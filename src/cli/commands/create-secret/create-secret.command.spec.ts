import { Test } from '@nestjs/testing';
import { CreateSecretCommand } from './create-secret.command';
import { CREATE_SECRET_SERVICE } from '../../../secrets/domain/create-secret.service.interface';
import type { ICreateSecretService } from '../../../secrets/domain/create-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('CreateSecretCommand', () => {
  let command: CreateSecretCommand;
  let mockService: jest.Mocked<ICreateSecretService>;
  let mockLogger: { log: jest.Mock; setContext: jest.Mock };

  const mockSecret = {
    id: '1',
    username: 'testuser',
    website: 'example.com',
    secretName: 'My Secret',
    password: 'pass123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue(mockSecret),
    };

    mockLogger = { log: jest.fn(), setContext: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        CreateSecretCommand,
        { provide: CREATE_SECRET_SERVICE, useValue: mockService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    command = module.get(CreateSecretCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should create a secret with all options', async () => {
    await command.run([], {
      username: 'testuser',
      website: 'example.com',
      secretName: 'My Secret',
      password: 'pass123',
    });
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith({
      username: 'testuser',
      website: 'example.com',
      secretName: 'My Secret',
      password: 'pass123',
    });
  });

  it('should throw when username is missing', async () => {
    await expect(
      command.run([], {
        website: 'example.com',
        secretName: 'My Secret',
        password: 'pass123',
      } as unknown as Parameters<typeof command.run>[1]),
    ).rejects.toThrow('All fields are required');
  });

  it('should throw when website is missing', async () => {
    await expect(
      command.run([], {
        username: 'testuser',
        secretName: 'My Secret',
        password: 'pass123',
      } as unknown as Parameters<typeof command.run>[1]),
    ).rejects.toThrow('All fields are required');
  });

  it('should throw when secretName is missing', async () => {
    await expect(
      command.run([], {
        username: 'testuser',
        website: 'example.com',
        password: 'pass123',
      } as unknown as Parameters<typeof command.run>[1]),
    ).rejects.toThrow('All fields are required');
  });

  it('should throw when password is missing', async () => {
    await expect(
      command.run([], {
        username: 'testuser',
        website: 'example.com',
        secretName: 'My Secret',
      } as unknown as Parameters<typeof command.run>[1]),
    ).rejects.toThrow('All fields are required');
  });
});
