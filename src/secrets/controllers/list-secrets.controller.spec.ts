import { Test } from '@nestjs/testing';
import { ListSecretsController } from './list-secrets.controller';
import { ListSecretsService } from '../services/list-secrets.service';

describe('ListSecretsController', () => {
  let controller: ListSecretsController;
  let mockService: { execute: jest.Mock };

  beforeEach(async () => {
    mockService = {
      execute: jest
        .fn()
        .mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
    };

    const module = await Test.createTestingModule({
      controllers: [ListSecretsController],
      providers: [{ provide: ListSecretsService, useValue: mockService }],
    }).compile();

    controller = module.get(ListSecretsController);
  });

  it('should delegate to service with pagination', async () => {
    const result = await controller.list({ page: 1, limit: 10 });
    expect(mockService.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.total).toBe(0);
  });
});
