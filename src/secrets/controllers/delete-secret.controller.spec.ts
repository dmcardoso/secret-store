import { Test } from '@nestjs/testing';
import { DeleteSecretController } from './delete-secret.controller';
import { DeleteSecretService } from '../services/delete-secret.service';

describe('DeleteSecretController', () => {
  let controller: DeleteSecretController;
  let mockService: { execute: jest.Mock };

  beforeEach(async () => {
    mockService = { execute: jest.fn().mockResolvedValue(undefined) };

    const module = await Test.createTestingModule({
      controllers: [DeleteSecretController],
      providers: [{ provide: DeleteSecretService, useValue: mockService }],
    }).compile();

    controller = module.get(DeleteSecretController);
  });

  it('should delegate to service with id', async () => {
    await controller.delete('1');
    expect(mockService.execute).toHaveBeenCalledWith('1');
  });
});
