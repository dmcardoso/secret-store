import { Test } from '@nestjs/testing';
import { GetSecretCommand } from './get-secret.command';
import { GET_SECRET_SERVICE } from '../../../secrets/domain/get-secret.service.interface';
import type { IGetSecretService } from '../../../secrets/domain/get-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('GetSecretCommand', () => {
  let command: GetSecretCommand;
  let mockService: jest.Mocked<IGetSecretService>;
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
        GetSecretCommand,
        { provide: GET_SECRET_SERVICE, useValue: mockService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    command = module.get(GetSecretCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should get a secret by ID', async () => {
    await command.run(['1']);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith('1');
  });

  it('should throw when no ID is provided', async () => {
    await expect(() => command.run([])).rejects.toThrow(
      'Secret ID is required: get-secret <id>',
    );
  });
});
