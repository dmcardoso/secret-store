import { Test } from '@nestjs/testing';
import { CreateSecretController } from './create-secret.controller';
import { CREATE_SECRET_SERVICE } from '../domain/create-secret.service.interface';
import type { ICreateSecretService } from '../domain/create-secret.service.interface';
import type { CreateSecretDto } from '../dto/create-secret.dto';

describe('CreateSecretController', () => {
  let controller: CreateSecretController;
  let mockService: jest.Mocked<ICreateSecretService>;

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({ id: '1', username: 'u' }),
    };

    const module = await Test.createTestingModule({
      controllers: [CreateSecretController],
      providers: [{ provide: CREATE_SECRET_SERVICE, useValue: mockService }],
    }).compile();

    controller = module.get(CreateSecretController);
  });

  it('should delegate to service', async () => {
    const dto: CreateSecretDto = {
      username: 'u',
      website: 'w',
      secretName: 's',
      password: 'p',
    };
    const result = await controller.create(dto);
    expect(jest.spyOn(mockService, 'execute')).toHaveBeenCalledWith(dto);
    expect(result.id).toBe('1');
  });
});
