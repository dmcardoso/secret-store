import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { EntityManager } from '@mikro-orm/core';
import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/shared/logger/logger.service';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';
import { SecretSchema } from '../src/secrets/entities/secret.entity';

interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

interface SecretResponse {
  id: string;
  username: string;
  website: string;
  secretName: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: SecretResponse[];
  total: number;
  page: number;
  limit: number;
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
}

/**
 * Suite de Testes de Integração Gerada a partir do Prompt Tipo 2:
 * "Prompt Orientado a Fluxo Transversal de Componentes e Invariantes de Estado"
 *
 * Foco: Validar a comunicação cross-component entre HTTP -> Controllers ->
 * Domain Services -> EncryptionService (AES-256-CBC) -> MikroORM EntityRepository -> PostgreSQL.
 *
 * Garante que:
 * 1. O banco NUNCA armazena senhas em texto claro (invariante criptográfico no banco).
 * 2. As leituras via API decifram a senha de ponta a ponta com sucesso.
 * 3. Mutações via PUT atualizam ciphertext com novo vetor de inicialização (IV).
 * 4. A exclusão via DELETE remove a entidade física do PostgreSQL e reflete em 404 nas consultas.
 * 5. Corrupção de dados cifrados no banco é tratada com segurança pelo pipeline.
 */
describe('Secrets Lifecycle & Cryptographic Invariants (Prompt Tipo 2)', () => {
  let app: INestApplication<App>;
  let em: EntityManager;

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

    em = app.get(EntityManager);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Fluxo Integrado de Ponta a Ponta e Invariantes de Persistência', () => {
    let createdSecretId: string;
    let initialCiphertext: string;
    const initialPlainPassword = 'ultra-secret-token-#2026';
    const createPayload = {
      username: 'integration_agent',
      website: 'https://vault.internal.network',
      secretName: 'Token de Produção de Teste',
      password: initialPlainPassword,
    };

    it('1. POST /api/secrets — cria o segredo e retorna payload envelopado com senha em texto plano', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/secrets')
        .send(createPayload)
        .expect(201);

      const body = response.body as unknown as ApiResponse<SecretResponse>;
      expect(body.data).toBeDefined();
      expect(body.data.id).toBeDefined();
      expect(body.data.username).toBe(createPayload.username);
      expect(body.data.website).toBe(createPayload.website);
      expect(body.data.secretName).toBe(createPayload.secretName);
      expect(body.data.password).toBe(initialPlainPassword);
      expect(body.timestamp).toBeDefined();

      createdSecretId = body.data.id;
    });

    it('2. Invariante de Banco de Dados — comprova que a senha armazenada no PostgreSQL está criptografada e não vaza texto plano', async () => {
      // Consulta direta à base de dados via MikroORM (bypassing controller/service)
      const persistedRecord = await em.fork().findOne(SecretSchema, {
        id: createdSecretId,
      });

      expect(persistedRecord).not.toBeNull();
      // O formato deve ser exatamente ivHex:ciphertextHex (AES-256-CBC, IV tem 16 bytes = 32 hex chars)
      expect(persistedRecord?.encryptedPassword).toMatch(
        /^[0-9a-f]{32}:[0-9a-f]+$/i,
      );
      // Invariante de segurança crítico: o texto plano NÃO pode constar na coluna do banco
      expect(persistedRecord?.encryptedPassword).not.toContain(
        initialPlainPassword,
      );
      expect(persistedRecord?.username).toBe(createPayload.username);

      initialCiphertext = persistedRecord!.encryptedPassword;
    });

    it('3. GET /api/secrets/:id — recupera e decifra o segredo através da cadeia Controller -> Service -> Encryption -> DB', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/secrets/${createdSecretId}`)
        .expect(200);

      const body = response.body as unknown as ApiResponse<SecretResponse>;
      expect(body.data.id).toBe(createdSecretId);
      // A API entrega a senha descriptografada transparente ao cliente HTTP
      expect(body.data.password).toBe(initialPlainPassword);
    });

    it('4. PUT /api/secrets/:id — atualiza o segredo e gera um novo IV/ciphertext no banco de dados', async () => {
      const updatedPlainPassword = 'new-updated-passphrase-999';
      const updatePayload = {
        secretName: 'Nome Atualizado do Segredo',
        password: updatedPlainPassword,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/secrets/${createdSecretId}`)
        .send(updatePayload)
        .expect(200);

      const body = response.body as unknown as ApiResponse<SecretResponse>;
      expect(body.data.secretName).toBe(updatePayload.secretName);
      expect(body.data.password).toBe(updatedPlainPassword);
      expect(body.data.username).toBe(createPayload.username); // campo inalterado preservado

      // Verificação no banco: comprovar que o ciphertext mudou
      const updatedDbRecord = await em.fork().findOne(SecretSchema, {
        id: createdSecretId,
      });

      expect(updatedDbRecord?.encryptedPassword).not.toBe(initialCiphertext);
      expect(updatedDbRecord?.encryptedPassword).toMatch(
        /^[0-9a-f]{32}:[0-9a-f]+$/i,
      );
      expect(updatedDbRecord?.encryptedPassword).not.toContain(
        updatedPlainPassword,
      );
    });

    it('5. GET /api/secrets — paginação integrada retorna lista contendo o segredo atualizado com valores decifrados', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/secrets?page=1&limit=10')
        .expect(200);

      const body = response.body as unknown as ApiResponse<PaginatedResponse>;
      expect(Array.isArray(body.data.data)).toBe(true);
      expect(body.data.total).toBeGreaterThanOrEqual(1);
      expect(body.data.page).toBe(1);
      expect(body.data.limit).toBe(10);

      const foundSecret = body.data.data.find((s) => s.id === createdSecretId);
      expect(foundSecret).toBeDefined();
      expect(foundSecret?.password).toBe('new-updated-passphrase-999');
    });

    it('6. DELETE /api/secrets/:id — remove o registro e limpa fisicamente do banco de dados', async () => {
      await request(app.getHttpServer())
        .delete(`/api/secrets/${createdSecretId}`)
        .expect(204);

      // Verificação direta no banco: o registro deve ser nulo
      const deletedRecord = await em.fork().findOne(SecretSchema, {
        id: createdSecretId,
      });
      expect(deletedRecord).toBeNull();
    });

    it('7. GET /api/secrets/:id — após exclusão, consulta resulta em 404 consistente', async () => {
      await request(app.getHttpServer())
        .get(`/api/secrets/${createdSecretId}`)
        .expect(404);
    });
  });

  describe('Resiliência a Falhas de Cifragem na Integração', () => {
    it('deve retornar 500 sem derrubar o servidor quando os dados criptografados no banco estão corrompidos', async () => {
      // Inserção direta de registro malformado no PostgreSQL via EntityManager
      const forkEm = em.fork();
      const corruptedSecret = forkEm.create(SecretSchema, {
        username: 'corrupted_user',
        website: 'https://corrupt.example.com',
        secretName: 'Corrupted Secret',
        encryptedPassword: 'invalid-iv-and-not-valid-hex-data',
      });
      await forkEm.persist(corruptedSecret).flush();

      // Consulta via API REST: a decifragem em EncryptionService vai falhar
      const response = await request(app.getHttpServer())
        .get(`/api/secrets/${corruptedSecret.id}`)
        .expect(500);

      const body = response.body as unknown as ErrorResponse;
      expect(body.statusCode).toBe(500);
      expect(body.message).toBe('Internal server error');
      expect(typeof body.timestamp).toBe('string');

      // Cleanup
      await forkEm.remove(corruptedSecret).flush();
    });
  });
});
