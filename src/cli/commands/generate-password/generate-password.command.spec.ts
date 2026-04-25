import { Test } from '@nestjs/testing';
import { GeneratePasswordCommand } from './generate-password.command';
import { GENERATE_PASSWORD_SERVICE } from '../../../secrets/domain/generate-password.service.interface';
import type { IGeneratePasswordService } from '../../../secrets/domain/generate-password.service.interface';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('GeneratePasswordCommand', () => {
  let command: GeneratePasswordCommand;
  let mockService: jest.Mocked<IGeneratePasswordService>;
  let mockLogger: { log: jest.Mock; setContext: jest.Mock };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockReturnValue({ password: 'mocked-password' }),
    };

    mockLogger = { log: jest.fn(), setContext: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        GeneratePasswordCommand,
        { provide: GENERATE_PASSWORD_SERVICE, useValue: mockService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    command = module.get(GeneratePasswordCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should log generated password with default options', async () => {
    await command.run([]);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith({});
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Your password is: mocked-password',
    );
  });

  it('should pass custom length to service', async () => {
    await command.run([], { length: 32 });
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith({
      length: 32,
    });
  });

  it('should throw for invalid length option', () => {
    expect(() => command.parseLength('abc')).toThrow(
      'Length must be a positive integer',
    );
  });

  it('should throw for zero length', () => {
    expect(() => command.parseLength('0')).toThrow(
      'Length must be a positive integer',
    );
  });

  it('should throw for negative length', () => {
    expect(() => command.parseLength('-5')).toThrow(
      'Length must be a positive integer',
    );
  });

  it('should parse valid length string to number', () => {
    expect(command.parseLength('24')).toBe(24);
  });
});
