import { Test } from '@nestjs/testing';
import { DeleteSecretController } from './delete-secret.controller';
import { DELETE_SECRET_SERVICE } from '../domain/delete-secret.service.interface';
import type { IDeleteSecretService } from '../domain/delete-secret.service.interface';

describe('DeleteSecretController', () => {
  let controller: DeleteSecretController;
  let mockService: jest.Mocked<IDeleteSecretService>;

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [DeleteSecretController],
      providers: [{ provide: DELETE_SECRET_SERVICE, useValue: mockService }],
    }).compile();

    controller = module.get(DeleteSecretController);
  });

  it('should delegate to service with id', async () => {
    await controller.delete('1');
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith('1');
  });
});
