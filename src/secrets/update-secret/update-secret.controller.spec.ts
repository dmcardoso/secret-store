import { Test } from '@nestjs/testing';
import { UpdateSecretController } from './update-secret.controller';
import { UPDATE_SECRET_SERVICE } from '../domain/update-secret.service.interface';
import type { IUpdateSecretService } from '../domain/update-secret.service.interface';
import type { UpdateSecretDto } from '../dto/update-secret.dto';

describe('UpdateSecretController', () => {
  let controller: UpdateSecretController;
  let mockService: jest.Mocked<IUpdateSecretService>;

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({ id: '1', username: 'new' }),
    };

    const module = await Test.createTestingModule({
      controllers: [UpdateSecretController],
      providers: [{ provide: UPDATE_SECRET_SERVICE, useValue: mockService }],
    }).compile();

    controller = module.get(UpdateSecretController);
  });

  it('should delegate to service with id and dto', async () => {
    const dto: UpdateSecretDto = { username: 'new' };
    const result = await controller.update('1', dto);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith('1', dto);
    expect(result.username).toBe('new');
  });
});
