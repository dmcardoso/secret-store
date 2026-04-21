import { Test } from '@nestjs/testing';
import { GetSecretController } from './get-secret.controller';
import { GetSecretService } from '../services/get-secret.service';

describe('GetSecretController', () => {
  let controller: GetSecretController;
  let mockService: { execute: jest.Mock };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({ id: '1', username: 'u' }),
    };

    const module = await Test.createTestingModule({
      controllers: [GetSecretController],
      providers: [{ provide: GetSecretService, useValue: mockService }],
    }).compile();

    controller = module.get(GetSecretController);
  });

  it('should delegate to service with id', async () => {
    const result = await controller.get('1');
    expect(mockService.execute).toHaveBeenCalledWith('1');
    expect(result.id).toBe('1');
  });
});
