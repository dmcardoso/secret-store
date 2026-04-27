# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Secret Store — a NestJS 11 application (TypeScript, pnpm) with MikroORM (PostgreSQL), Swagger/OpenAPI, and SWC builder. Runs as **two separate entry points**: an HTTP API and a CLI tool.

## Commands

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Build | `pnpm run build` |
| Dev server (watch) | `pnpm run start:dev` |
| Dev server (debug + watch) | `pnpm run start:debug` |
| Production start | `pnpm run start:prod` |
| CLI (production) | `pnpm run cli` |
| CLI (development) | `pnpm run cli:dev` |
| Lint (with auto-fix) | `pnpm run lint` |
| Format | `pnpm run format` |
| Unit tests | `pnpm run test` |
| Single test file | `pnpm run test -- --testPathPattern=app.controller` |
| Watch tests | `pnpm run test:watch` |
| Coverage | `pnpm run test:cov` |
| E2E tests | `pnpm run test:e2e` |
| Create DB schema | `pnpm run schema:create` |
| Update DB schema | `pnpm run schema:update` |
| Fresh DB schema | `pnpm run schema:fresh` |
| Docker up | `docker compose up -d` |
| Docker down | `docker compose down` |
| Docker logs | `docker compose logs -f postgres` |
| Docker full stack up | `ENCRYPTION_KEY="..." docker compose up -d` |
| Docker full stack down | `docker compose down` |
| Docker rebuild | `docker compose build --no-cache secret-store` |
| Docker CLI exec | `docker compose exec secret-store node dist/cli/main.js <command>` |

## Project Conventions

- **All features must be covered with unit AND integration tests.**
- **Nest CLI is available** for scaffolding (`nest g module <name>`, `nest g resource <name>`, etc.).
- **Each module holds ONE feature only.** A feature module groups its own controller, service, repository, DTOs, and entity.
- **Each controller has ONE method/endpoint.** One controller per route; if a feature needs multiple endpoints, create separate controllers within the module.
- **Each service has ONE public method.** Split responsibilities into separate services rather than adding methods.
- **Each repository has ONE responsibility/public method.** Use custom repositories extending `EntityRepository`.
- **All layers are independent and injectable** for easy testing. Dependencies are injected via constructor, never instantiated directly.
- **Best practices of code and context engineering:** clean separation of concerns, SOLID principles, explicit dependency management.
- **No barrel files (`index.ts`).** They cause circular dependency issues.
- **Logger context is set explicitly** in constructors via `this.logService.setContext(ClassName)`.

## Architecture

```
src/
  main.ts                          # HTTP API entry: NestFactory.create(AppModule)
  app.module.ts                    # Root module: ConfigModule, DatabaseModule, SharedModule, SecretsModule
  app.controller.ts                # Health check (GET /api/health)
  app.service.ts
  config/
    configuration.ts               # Typed config factory (node, database, swagger groups)
    env.validation.ts              # Joi schema for HTTP API env vars
    config.module.ts               # ConfigModule.forRoot (global)
  database/
    database.module.ts             # MikroORM forRootAsync with ConfigService
  shared/
    shared.module.ts               # @Global module for cross-cutting providers
    logger/
      logger.service.ts            # Custom ConsoleLogger (TRANSIENT scope)
      logger.module.ts
    filters/
      http-exception.filter.ts     # Global exception filter
    interceptors/
      transform.interceptor.ts     # Global response wrapper
    dto/
      pagination.dto.ts            # Reusable pagination DTO
      api-response.dto.ts          # Generic API response wrapper
  cli/
    main.ts                        # CLI entry: CommandFactory.run(CliModule)
    cli.module.ts                  # Imports CliConfigModule, SharedModule, all command modules
    config/
      cli-config.module.ts         # ConfigModule for CLI context
      cli-env.validation.ts        # Joi schema for CLI env vars (ENCRYPTION_KEY optional)
    commands/
      base.command.ts              # Shared CLI options (extends CommandRunner)
      generate-password/           # Self-contained: command, module, dto, spec
      create-secret/
      get-secret/
      list-secrets/
      update-secret/
      delete-secret/
    utils/
      output.util.ts               # CLI output formatting utilities
  secrets/
    secrets.module.ts              # Imports all sub-modules
    mappers/
      secret.mapper.ts             # Entity-to-DTO mapping (DRY)
    entities/
      secret.entity.ts             # Secret entity (defineEntity, uuidv7 PK)
    repositories/
      secret.repository.ts         # Custom repo with findPaginated()
    domain/                        # Service interfaces with Symbol injection tokens
      create-secret.service.interface.ts
      delete-secret.service.interface.ts
      generate-password.service.interface.ts
      get-secret.service.interface.ts
      list-secrets.service.interface.ts
      update-secret.service.interface.ts
    dto/
      create-secret.dto.ts
      update-secret.dto.ts
      secret-response.dto.ts
      generate-password.dto.ts
      generate-password-response.dto.ts
    create-secret/                 # Each sub-dir: module, controller, service, specs
    delete-secret/
    generate-password/
    get-secret/
    list-secrets/
    update-secret/
test/
  app.e2e-spec.ts
  secrets.e2e-spec.ts
  jest-e2e.json
```

## Dual App Architecture

The project runs as two independent NestJS applications sharing the same codebase:

| | HTTP API | CLI |
|---|---|---|
| Entry point | `src/main.ts` | `src/cli/main.ts` |
| Root module | `AppModule` | `CliModule` |
| Bootstrap | `NestFactory.create()` | `CommandFactory.run()` |
| Config validation | `env.validation.ts` (ENCRYPTION_KEY required) | `cli-env.validation.ts` (ENCRYPTION_KEY optional) |
| Shared code | `SharedModule`, `SecretsModule` | `SharedModule`, service interfaces via `domain/` |

Both apps share `SharedModule` (logger, filters, interceptors) and the `secrets/domain/` service interfaces.

## Secrets Feature

### Domain Interfaces Pattern

Services are injected via **Symbol tokens and interfaces**, not concrete classes. This decouples the CLI commands from specific service implementations:

```typescript
// domain/get-secret.service.interface.ts
export const GET_SECRET_SERVICE = Symbol('GET_SECRET_SERVICE');
export interface IGetSecretService {
  execute(id: string): Promise<SecretResponseDto>;
}

// In the module, bind the token:
{ provide: GET_SECRET_SERVICE, useClass: GetSecretService }
```

### Feature Sub-Module Structure

Each CRUD operation is a self-contained sub-module under `secrets/`:
```
secrets/get-secret/
  get-secret.module.ts       # MikroOrmModule.forFeature + binds interface token
  get-secret.controller.ts   # @Inject(GET_SECRET_SERVICE)
  get-secret.service.ts      # Implements IGetSecretService
  get-secret.controller.spec.ts
  get-secret.service.spec.ts
```

### Entity

Uses MikroORM's `defineEntity` (not class-based decorator pattern):
- Primary key: `uuidv7()` auto-generated
- Timestamps: `onCreate` / `onUpdate` hooks
- Custom repository: `SecretRepository` with `findPaginated()`

## CLI Commands

Each command under `src/cli/commands/` is a self-contained module following the same one-method convention:

| Command | Description |
|---|---|
| `generate-password` | Generate a random password (`-l, --length`) |
| `create-secret` | Create a new secret |
| `get-secret` | Retrieve a secret by ID |
| `list-secrets` | List secrets with pagination |
| `update-secret` | Update an existing secret |
| `delete-secret` | Delete a secret |

Commands use `nest-commander` (`@Command`, `@Option`). All commands except `generate-password` extend `BaseCommand` (which extends `CommandRunner` and provides the shared `--json` option). CLI commands inject service interfaces from `secrets/domain/` via Symbol tokens.

## Environment Variables

| Variable | Default | Required (API) | Required (CLI) |
|---|---|---|---|
| `NODE_ENV` | `development` | Yes | Yes |
| `PORT` | `3000` | Yes | — |
| `DB_HOST` | `localhost` | Yes | Yes |
| `DB_PORT` | `5432` | Yes | Yes |
| `DB_NAME` | `secret_store` | Yes | Yes |
| `DB_USER` | `secret_store_user` | Yes | Yes |
| `DB_PASSWORD` | `secret_store_password` | Yes | Yes |
| `SWAGGER_ENABLED` | `true` (API) / `false` (CLI) | Yes | Yes |
| `ENCRYPTION_KEY` | — | Yes (32 chars) | Optional |

## Adding a New Feature Module

### HTTP Endpoint

1. Create sub-module under `secrets/<feature>/`: module, controller, service, DTOs, specs.
2. Define a service interface + Symbol token in `secrets/domain/`.
3. If the service returns a `SecretResponseDto`, use `SecretMapper.toResponseDto()` from `secrets/mappers/`.
4. Register entity via `MikroOrmModule.forFeature([SecretSchema])` in the sub-module.
5. Bind the interface token to the concrete service in the sub-module's providers.
6. Import the sub-module in `SecretsModule`.
7. API prefix is `api/` (set globally in `main.ts`).

### CLI Command

1. Create sub-module under `src/cli/commands/<command>/`: command, module, dto, spec.
2. Use `@Command({ name, description })` and extend `BaseCommand` (from `src/cli/commands/base.command.ts`).
3. Inject the service interface from `secrets/domain/` via Symbol token.
4. Import the command module in `CliModule`.
5. Ensure the service sub-module exports the Symbol token — CLI command modules import service modules and need the provider visible.

### Module Registration Pattern

```typescript
@Module({
  imports: [MikroOrmModule.forFeature([SecretSchema])],
  controllers: [GetSecretController],
  providers: [
    { provide: GET_SECRET_SERVICE, useClass: GetSecretService },
    GetSecretService,
  ],
  exports: [GET_SECRET_SERVICE],
})
export class GetSecretModule {}
```

## Database (MikroORM)

- **Driver**: PostgreSQL (`@mikro-orm/postgresql`)
- **Entity style**: `defineEntity()` with `InferEntity` type (not class decorators)
- **Custom repositories**: extend `EntityRepository`, referenced via `repository: () => RepoClass`
- **Auto-loading**: `autoLoadEntities: true` — entities registered via `forFeature()` are discovered automatically
- **Schema commands**: `schema:create`, `schema:update`, `schema:fresh` (via `pnpm run`)
- **Debug mode**: enabled when `NODE_ENV=development`
- **Never use `synchronize: true` in production** — use migrations or schema commands.

### Test Mocking

```typescript
{ provide: GET_SECRET_SERVICE, useValue: mockService }
{ provide: getRepositoryToken(SecretSchema), useValue: mockRepository }
```

## Swagger/OpenAPI

- Configured in `main.ts` with `DocumentBuilder`, gated behind `SWAGGER_ENABLED`.
- Swagger UI at `/api/docs`.
- Use `@ApiTags('name')` to group controllers, `@ApiOperation` for endpoint descriptions.
- `@nestjs/swagger` plugin auto-generates `@ApiProperty` metadata.

## Code Principles

- **DRY — Extract mappers:** When the same entity-to-DTO mapping appears in more than one service, extract it into a static mapper under `secrets/mappers/`. Services call `Mapper.toDto(entity, ...deps)`.
- **SOLID — Interface types must be precise:** Domain interfaces in `secrets/domain/` must use concrete return types (e.g., `SecretResponseDto[]`), never `unknown[]` or `any`.
- **SOLID — Nullish coalescing for optionals:** Use `??` (not `? :`) when falling back on a value for `null`/`undefined` checks — avoids falsy-string bugs.
- **DRY — Shared CLI options in BaseCommand:** Common CLI options (e.g., `--json`) live in `BaseCommand`. New commands with `--json` extend `BaseCommand`; commands without it extend `CommandRunner` directly.
- **No dead code:** Delete unused DTOs, interfaces, or imports immediately. If a type exists in two places, keep one canonical definition.

## Gotchas

- **CLI errors are silent.** `pnpm cli:dev` exits with code 1 and no output on NestJS bootstrap failures. To see the actual error, run:
  ```bash
  node --trace-uncaught -e "
    require('ts-node/register');
    require('tsconfig-paths/register');
    const { CommandFactory } = require('nest-commander');
    const { CliModule } = require('./src/cli/cli.module');
    CommandFactory.run(CliModule, ['<command-name>'])
      .catch(err => { process.stderr.write(err.stack + '\n'); process.exit(1); });
  " 2>&1
  ```
- **Symbol tokens must be exported.** Service sub-modules that bind a Symbol token via `{ provide: SYMBOL, useClass: Service }` must also include it in `exports: [SYMBOL]`. Without this, importing modules (e.g., CLI command modules) get `Nest can't resolve dependencies` errors.
- **MikroOrmModule.forRootAsync requires top-level `driver`.** When using `forRootAsync` with `useFactory`, set `driver: PostgreSqlDriver` at the `forRootAsync` level (not only inside `useFactory`) — otherwise NestJS module resolution fails.

## Code Style

- Prettier: single quotes, trailing commas (`all`).
- ESLint with `typescript-eslint` recommended type-checked config + Prettier integration.
- TypeScript: `ES2023` target, `commonjs` module resolution, decorators enabled.
- `noImplicitAny` is **off**; `strictNullChecks` is **on**.
- SWC builder (`nest-cli.json`: `builder: "swc"`, `typeCheck: true`).
- Jest uses `@swc/jest` transformer.

## Testing

- `*.spec.ts` — unit tests (root: `src/`)
- `*.e2e-spec.ts` — e2e tests (root: `test/`)
- Use `Test.createTestingModule()` with interface token overrides for service mocks.
- Always call `await app.close()` in e2e tests.
