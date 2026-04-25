import { Test } from '@nestjs/testing';
import { GeneratePasswordService } from './generate-password.service';

describe('GeneratePasswordService', () => {
  let service: GeneratePasswordService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GeneratePasswordService],
    }).compile();
    service = module.get(GeneratePasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a password with default length of 16', () => {
    const result = service.execute({});
    expect(result.password).toHaveLength(16);
  });

  it('should generate a password with custom length', () => {
    const result = service.execute({ length: 32 });
    expect(result.password).toHaveLength(32);
  });

  it('should generate different passwords on each call', () => {
    const result1 = service.execute({});
    const result2 = service.execute({});
    expect(result1.password).not.toBe(result2.password);
  });

  it('should only use characters from the default charset', () => {
    const defaultCharset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const result = service.execute({ length: 100 });
    for (const char of result.password) {
      expect(defaultCharset).toContain(char);
    }
  });

  it('should use custom charset when provided', () => {
    const result = service.execute({ length: 10, charset: 'abc' });
    for (const char of result.password) {
      expect('abc').toContain(char);
    }
  });

  it('should generate a password of length 1', () => {
    const result = service.execute({ length: 1 });
    expect(result.password).toHaveLength(1);
  });
});
