import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { LoggerService } from './../src/shared/logger/logger.service';

interface SecretResponse {
  id: string;
  username: string;
  website: string;
  secretName: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

interface PaginatedResponse {
  data: SecretResponse[];
  total: number;
  page: number;
  limit: number;
}

describe('Secrets (e2e)', () => {
  let app: INestApplication<App>;
  let createdId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue({ log: jest.fn(), error: jest.fn(), warn: jest.fn() })
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const secretPayload = {
    username: 'testuser',
    website: 'example.com',
    secretName: 'Test Secret',
    password: 'my-secure-password',
  };

  it('POST /api/secrets — should create a secret', () => {
    return request(app.getHttpServer())
      .post('/api/secrets')
      .send(secretPayload)
      .expect(201)
      .expect((res: { body: ApiResponse<SecretResponse> }) => {
        const secret = res.body.data;
        expect(secret).toMatchObject({
          username: secretPayload.username,
          website: secretPayload.website,
          secretName: secretPayload.secretName,
          password: secretPayload.password,
        });
        expect(secret.id).toBeDefined();
        createdId = secret.id;
      });
  });

  it('GET /api/secrets — should list secrets', () => {
    return request(app.getHttpServer())
      .get('/api/secrets')
      .expect(200)
      .expect((res: { body: ApiResponse<PaginatedResponse> }) => {
        expect(res.body.data.data).toBeInstanceOf(Array);
        expect(res.body.data.total).toBeGreaterThan(0);
      });
  });

  it('GET /api/secrets/:id — should get a secret by id', () => {
    return request(app.getHttpServer())
      .get(`/api/secrets/${createdId}`)
      .expect(200)
      .expect((res: { body: ApiResponse<SecretResponse> }) => {
        expect(res.body.data.id).toBe(createdId);
        expect(res.body.data.password).toBe(secretPayload.password);
      });
  });

  it('PUT /api/secrets/:id — should update a secret', () => {
    return request(app.getHttpServer())
      .put(`/api/secrets/${createdId}`)
      .send({ username: 'updateduser', password: 'new-password-123' })
      .expect(200)
      .expect((res: { body: ApiResponse<SecretResponse> }) => {
        expect(res.body.data.username).toBe('updateduser');
        expect(res.body.data.password).toBe('new-password-123');
      });
  });

  it('DELETE /api/secrets/:id — should delete a secret', () => {
    return request(app.getHttpServer())
      .delete(`/api/secrets/${createdId}`)
      .expect(204);
  });

  it('GET /api/secrets/:id — should return 404 after deletion', () => {
    return request(app.getHttpServer())
      .get(`/api/secrets/${createdId}`)
      .expect(404);
  });
});
