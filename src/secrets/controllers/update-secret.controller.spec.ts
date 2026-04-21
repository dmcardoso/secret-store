import { Test } from '@nestjs/testing';
import { UpdateSecretController } from './update-secret.controller';
import { UpdateSecretService } from '../services/update-secret.service';

describe('UpdateSecretController', () => {
  let controller: UpdateSecretController;
  let mockService: { execute: jest.Mock };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({ id: '1', username: 'new' }),
    };

    const module = await Test.createTestingModule({
      controllers: [UpdateSecretController],
      providers: [{ provide: UpdateSecretService, useValue: mockService }],
    }).compile();

    controller = module.get(UpdateSecretController);
  });

  it('should delegate to service with id and dto', async () => {
    const dto = { username: 'new' };
    const result = await controller.update('1', dto);
    expect(mockService.execute).toHaveBeenCalledWith('1', dto);
    expect(result.username).toBe('new');
  });
});
