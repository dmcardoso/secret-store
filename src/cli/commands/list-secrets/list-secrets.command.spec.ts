import { Test } from '@nestjs/testing';
import { ListSecretsCommand } from './list-secrets.command';
import { LIST_SECRETS_SERVICE } from '../../../secrets/domain/list-secrets.service.interface';
import type { IListSecretsService } from '../../../secrets/domain/list-secrets.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('ListSecretsCommand', () => {
  let command: ListSecretsCommand;
  let mockService: jest.Mocked<IListSecretsService>;
  let mockLogger: { log: jest.Mock; setContext: jest.Mock };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            username: 'user1',
            website: 'example.com',
            secretName: 'Secret 1',
            password: 'pass1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      }),
    };

    mockLogger = { log: jest.fn(), setContext: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        ListSecretsCommand,
        { provide: LIST_SECRETS_SERVICE, useValue: mockService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    command = module.get(ListSecretsCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should list secrets with default pagination', async () => {
    await command.run([]);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('should pass custom page and limit', async () => {
    await command.run([], { page: 2, limit: 25 });
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith({
      page: 2,
      limit: 25,
    });
  });

  it('should throw for invalid page', () => {
    expect(() => command.parsePage('abc')).toThrow(
      'Page must be a positive integer',
    );
  });

  it('should throw for zero page', () => {
    expect(() => command.parsePage('0')).toThrow(
      'Page must be a positive integer',
    );
  });

  it('should throw for invalid limit', () => {
    expect(() => command.parseLimit('abc')).toThrow(
      'Limit must be a positive integer',
    );
  });

  it('should throw for limit exceeding 100', () => {
    expect(() => command.parseLimit('101')).toThrow(
      'Limit must not exceed 100',
    );
  });

  it('should parse valid page string to number', () => {
    expect(command.parsePage('3')).toBe(3);
  });

  it('should parse valid limit string to number', () => {
    expect(command.parseLimit('50')).toBe(50);
  });
});
