import { Test } from '@nestjs/testing';
import { GetSecretController } from './get-secret.controller';
import { GET_SECRET_SERVICE } from '../domain/get-secret.service.interface';
import type { IGetSecretService } from '../domain/get-secret.service.interface';

describe('GetSecretController', () => {
  let controller: GetSecretController;
  let mockService: jest.Mocked<IGetSecretService>;

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({ id: '1', username: 'u' }),
    };

    const module = await Test.createTestingModule({
      controllers: [GetSecretController],
      providers: [{ provide: GET_SECRET_SERVICE, useValue: mockService }],
    }).compile();

    controller = module.get(GetSecretController);
  });

  it('should delegate to service with id', async () => {
    const result = await controller.get('1');
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith('1');
    expect(result.id).toBe('1');
  });
});
