import { Test } from '@nestjs/testing';
import { UpdateSecretCommand } from './update-secret.command';
import { UPDATE_SECRET_SERVICE } from '../../../secrets/domain/update-secret.service.interface';
import type { IUpdateSecretService } from '../../../secrets/domain/update-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('UpdateSecretCommand', () => {
  let command: UpdateSecretCommand;
  let mockService: jest.Mocked<IUpdateSecretService>;
  let mockLogger: { log: jest.Mock; setContext: jest.Mock };

  const mockSecret = {
    id: '1',
    username: 'updated',
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
        UpdateSecretCommand,
        { provide: UPDATE_SECRET_SERVICE, useValue: mockService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    command = module.get(UpdateSecretCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should update a secret with single field', async () => {
    await command.run(['1'], { username: 'updated' });
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith('1', {
      username: 'updated',
    });
  });

  it('should update a secret with multiple fields', async () => {
    await command.run(['1'], {
      username: 'updated',
      website: 'new.com',
      secretName: 'New Name',
      password: 'newpass',
    });
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith('1', {
      username: 'updated',
      website: 'new.com',
      secretName: 'New Name',
      password: 'newpass',
    });
  });

  it('should throw when no ID is provided', async () => {
    await expect(() => command.run([], { username: 'test' })).rejects.toThrow(
      'Secret ID is required: update-secret <id>',
    );
  });

  it('should throw when no fields are provided', async () => {
    await expect(() => command.run(['1'])).rejects.toThrow(
      'At least one field is required',
    );
  });
});
