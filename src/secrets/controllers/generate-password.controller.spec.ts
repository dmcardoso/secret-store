import { Test } from '@nestjs/testing';
import { GeneratePasswordController } from './generate-password.controller';
import { GENERATE_PASSWORD_SERVICE } from '../domain/generate-password.service.interface';
import type { IGeneratePasswordService } from '../domain/generate-password.service.interface';
import type { GeneratePasswordDto } from '../dto/generate-password.dto';

describe('GeneratePasswordController', () => {
  let controller: GeneratePasswordController;
  let mockService: jest.Mocked<IGeneratePasswordService>;

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockReturnValue({ password: 'mocked-password' }),
    };

    const module = await Test.createTestingModule({
      controllers: [GeneratePasswordController],
      providers: [
        { provide: GENERATE_PASSWORD_SERVICE, useValue: mockService },
      ],
    }).compile();

    controller = module.get(GeneratePasswordController);
  });

  it('should delegate to service and return result', () => {
    const dto: GeneratePasswordDto = { length: 32, charset: 'abc' };
    const result = controller.generate(dto);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith(dto);
    expect(result.password).toBe('mocked-password');
  });

  it('should delegate with empty dto', () => {
    controller.generate({});
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith({});
  });
});
