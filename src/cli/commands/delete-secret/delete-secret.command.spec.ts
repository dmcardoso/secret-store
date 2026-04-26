import { Test } from '@nestjs/testing';
import { DeleteSecretCommand } from './delete-secret.command';
import { DELETE_SECRET_SERVICE } from '../../../secrets/domain/delete-secret.service.interface';
import type { IDeleteSecretService } from '../../../secrets/domain/delete-secret.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('DeleteSecretCommand', () => {
  let command: DeleteSecretCommand;
  let mockService: jest.Mocked<IDeleteSecretService>;
  let mockLogger: { log: jest.Mock; setContext: jest.Mock };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    mockLogger = { log: jest.fn(), setContext: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        DeleteSecretCommand,
        { provide: DELETE_SECRET_SERVICE, useValue: mockService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    command = module.get(DeleteSecretCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should delete a secret by ID', async () => {
    await command.run(['1']);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith('1');
  });

  it('should throw when no ID is provided', async () => {
    await expect(() => command.run([])).rejects.toThrow(
      'Secret ID is required: delete-secret <id>',
    );
  });
});
