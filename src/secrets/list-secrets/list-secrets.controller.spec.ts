import { Test } from '@nestjs/testing';
import { ListSecretsController } from './list-secrets.controller';
import { LIST_SECRETS_SERVICE } from '../domain/list-secrets.service.interface';
import type { IListSecretsService } from '../domain/list-secrets.service.interface';
import type { PaginationDto } from '../../shared/dto/pagination.dto';

describe('ListSecretsController', () => {
  let controller: ListSecretsController;
  let mockService: jest.Mocked<IListSecretsService>;

  beforeEach(async () => {
    mockService = {
      execute: jest
        .fn()
        .mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
    };

    const module = await Test.createTestingModule({
      controllers: [ListSecretsController],
      providers: [{ provide: LIST_SECRETS_SERVICE, useValue: mockService }],
    }).compile();

    controller = module.get(ListSecretsController);
  });

  it('should delegate to service with pagination', async () => {
    const pagination: PaginationDto = { page: 1, limit: 10 };
    const result = await controller.list(pagination);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith(pagination);
    expect(result.total).toBe(0);
  });
});
