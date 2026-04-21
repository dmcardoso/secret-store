import { Test } from '@nestjs/testing';
import { CreateSecretController } from './create-secret.controller';
import { CreateSecretService } from '../services/create-secret.service';

describe('CreateSecretController', () => {
  let controller: CreateSecretController;
  let mockService: { execute: jest.Mock };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({ id: '1', username: 'u' }),
    };

    const module = await Test.createTestingModule({
      controllers: [CreateSecretController],
      providers: [{ provide: CreateSecretService, useValue: mockService }],
    }).compile();

    controller = module.get(CreateSecretController);
  });

  it('should delegate to service', async () => {
    const dto = { username: 'u', website: 'w', secretName: 's', password: 'p' };
    const result = await controller.create(dto);
    expect(mockService.execute).toHaveBeenCalledWith(dto);
    expect(result.id).toBe('1');
  });
});
