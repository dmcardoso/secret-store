import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/shared/logger/logger.service';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
}

/**
 * Suite de Testes de Integração Gerada a partir do Prompt Tipo 1:
 * "Prompt Orientado a Contrato e Casos Negativos de Fronteira"
 *
 * Foco: Validar as fronteiras HTTP REST, conformidade dos DTOs com ValidationPipe,
 * rejeição de propriedades não permitidas (forbidNonWhitelisted), tipos inválidos
 * e formatação consistente de erros via HttpExceptionFilter.
 */
describe('Secrets API Contract & Negative Integration Tests (Prompt Tipo 1)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        setContext: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/secrets - Validação de Contrato e Fronteira', () => {
    it('deve rejeitar payload vazio com 400 Bad Request e detalhar campos obrigatórios', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/secrets')
        .send({})
        .expect(400);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(400);
      expect(typeof body.timestamp).toBe('string');
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('username'),
          expect.stringContaining('website'),
          expect.stringContaining('secretName'),
          expect.stringContaining('password'),
        ]),
      );
    });

    it('deve rejeitar requisição com propriedades não mapeadas no DTO (forbidNonWhitelisted)', async () => {
      const payloadWithInjection = {
        username: 'valid_user',
        website: 'https://security.example.com',
        secretName: 'Token Seguro',
        password: 'super-password-123',
        isAdmin: true,
        role: 'superuser',
      };

      const response = await request(app.getHttpServer())
        .post('/api/secrets')
        .send(payloadWithInjection)
        .expect(400);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(400);
      expect(body.message).toEqual(
        expect.arrayContaining([
          'property isAdmin should not exist',
          'property role should not exist',
        ]),
      );
    });

    it('deve rejeitar tipos de dados inválidos (números em vez de string)', async () => {
      const invalidTypesPayload = {
        username: 12345,
        website: true,
        secretName: ['array', 'invalido'],
        password: { nested: 'object' },
      };

      const response = await request(app.getHttpServer())
        .post('/api/secrets')
        .send(invalidTypesPayload)
        .expect(400);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(400);
      expect(body.message).toEqual(
        expect.arrayContaining([
          'username must be a string',
          'website must be a string',
          'secretName must be a string',
          'password must be a string',
        ]),
      );
    });

    it('deve rejeitar campos vazios ou preenchidos apenas com strings vazias', async () => {
      const emptyFieldsPayload = {
        username: '',
        website: '',
        secretName: '',
        password: '',
      };

      const response = await request(app.getHttpServer())
        .post('/api/secrets')
        .send(emptyFieldsPayload)
        .expect(400);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(400);
      expect(body.message).toEqual(
        expect.arrayContaining([
          'username should not be empty',
          'website should not be empty',
          'secretName should not be empty',
          'password should not be empty',
        ]),
      );
    });
  });

  describe('PUT /api/secrets/:id - Validação Parcial e Fronteira', () => {
    it('deve rejeitar atualização contendo campos não permitidos no DTO', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .put(`/api/secrets/${nonExistentUuid}`)
        .send({
          invalidField: 'hacker',
          createdAt: new Date().toISOString(),
        })
        .expect(400);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(400);
      expect(body.message).toEqual(
        expect.arrayContaining([
          'property invalidField should not exist',
          'property createdAt should not exist',
        ]),
      );
    });

    it('deve retornar 404 quando o segredo para atualização não existe', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .put(`/api/secrets/${nonExistentUuid}`)
        .send({ username: 'novo_usuario' })
        .expect(404);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(404);
      expect(body.message).toBe(`Secret with id ${nonExistentUuid} not found`);
      expect(typeof body.timestamp).toBe('string');
    });
  });

  describe('GET /api/secrets/:id - Consulta de Entidade Inexistente', () => {
    it('deve retornar 404 estruturado pelo HttpExceptionFilter para UUID válido inexistente', async () => {
      const nonExistentUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      const response = await request(app.getHttpServer())
        .get(`/api/secrets/${nonExistentUuid}`)
        .expect(404);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(404);
      expect(body.message).toBe(`Secret with id ${nonExistentUuid} not found`);
      expect(typeof body.timestamp).toBe('string');
    });
  });

  describe('DELETE /api/secrets/:id - Exclusão de Entidade Inexistente', () => {
    it('deve retornar 404 ao tentar excluir segredo inexistente', async () => {
      const nonExistentUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      const response = await request(app.getHttpServer())
        .delete(`/api/secrets/${nonExistentUuid}`)
        .expect(404);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(404);
      expect(body.message).toBe(`Secret with id ${nonExistentUuid} not found`);
      expect(typeof body.timestamp).toBe('string');
    });
  });
});
