# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Secret Store — a NestJS 11 application (TypeScript, pnpm) with MikroORM (PostgreSQL), Swagger/OpenAPI, and SWC builder.

## Commands

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Build | `pnpm run build` |
| Dev server (watch) | `pnpm run start:dev` |
| Dev server (debug + watch) | `pnpm run start:debug` |
| Production start | `pnpm run start:prod` |
| Lint (with auto-fix) | `pnpm run lint` |
| Format | `pnpm run format` |
| Unit tests | `pnpm run test` |
| Single test file | `pnpm run test -- --testPathPattern=app.controller` |
| Watch tests | `pnpm run test:watch` |
| Coverage | `pnpm run test:cov` |
| E2E tests | `pnpm run test:e2e` |
| Docker up | `docker compose up -d` |
| Docker down | `docker compose down` |
| Docker logs | `docker compose logs -f postgres` |

## Project Conventions

- **All features must be covered with unit AND integration tests.**
- **Nest CLI is available** for scaffolding (`nest g module <name>`, `nest g resource <name>`, etc.).
- **Each module holds ONE feature only.** A feature module groups its own controller, service, repository, DTOs, and entity.
- **Each controller has ONE method/endpoint.** One controller per route; if a feature needs multiple endpoints, create separate controllers within the module.
- **Each service has ONE public method.** Split responsibilities into separate services rather than adding methods.
- **Each repository has ONE responsibility/public method.** Use custom repositories extending `EntityRepository`.
- **All layers are independent and injectable** for easy testing. Dependencies are injected via constructor, never instantiated directly.
- **Best practices of code and context engineering:** clean separation of concerns, SOLID principles, explicit dependency management.

## Architecture

```
src/
  main.ts                      # Bootstrap: logger, CORS, compression, Swagger, pipes, filters
  app.module.ts                # Root module: imports ConfigModule, DatabaseModule, SharedModule
  app.controller.ts            # Health check controller (GET /api/health)
  app.service.ts               # Health check service
  config/
    configuration.ts           # Typed config factory (node, database, swagger groups)
    env.validation.ts          # Joi schema for env var validation
    config.module.ts           # ConfigModule.forRoot (global)
  database/
    database.module.ts         # MikroORM forRootAsync with ConfigService
  shared/
    shared.module.ts           # @Global module for cross-cutting providers
    logger/
      logger.service.ts        # Custom ConsoleLogger (TRANSIENT scope)
      logger.module.ts
    filters/
      http-exception.filter.ts # Global exception filter
    interceptors/
      transform.interceptor.ts # Global response wrapper
    dto/
      pagination.dto.ts        # Reusable pagination DTO
      api-response.dto.ts      # Generic API response wrapper
test/
  app.e2e-spec.ts              # E2E tests
  jest-e2e.json                # E2E Jest config
```

### Adding a New Feature Module

Use the Nest CLI:
```bash
nest g resource <feature-name>
```
This generates: module, controller, service, DTOs, entity, and spec files. Then refactor to follow the one-method convention.

### Module Registration Pattern

1. Create feature module with its own controller, service, and repository.
2. Register entity in the feature module via `MikroOrmModule.forFeature([Entity])`.
3. Import the feature module in `AppModule`.

## NestJS Modules

### @Module Decorator

```typescript
@Module({
  imports: [],      // Modules whose exported providers are needed here
  controllers: [],  // Controllers instantiated by this module
  providers: [],    // Providers instantiated by the Nest injector
  exports: [],      // Providers available to modules that import this module
})
```

### Feature Modules

Organize code by domain. Each feature module is self-contained:
```typescript
@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Shared Modules

Export providers that other modules need. Modules are **singletons by default** — the same provider instance is shared across importing modules.

### Global Modules

Use `@Global()` to make exported providers available everywhere without explicit imports. Register **only once** (typically in the root module). Do not overuse — prefer explicit `imports`.

### Dynamic Modules

Configure modules at runtime with static methods:

| Method | Purpose |
|---|---|
| `forRoot()` | Configure once globally (e.g., database connection) |
| `forFeature()` | Register feature-specific entities/config (e.g., repositories) |
| `register()` | Per-call configuration with different settings each time |

Each has an async variant: `forRootAsync`, `forFeatureAsync`, `registerAsync`.

### ConfigurableModuleBuilder

Utility for creating dynamic modules with minimal boilerplate:
```typescript
const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<Options>().build();
```
Auto-generates `register()`, `registerAsync()`, and the options injection token.

## Dependency Injection

### Provider Scopes

| Scope | Behavior | Use Case |
|---|---|---|
| `DEFAULT` (singleton) | One instance shared app-wide. **Recommended.** | Most services, repositories |
| `REQUEST` | New instance per HTTP request. | Per-request caching, multi-tenancy |
| `TRANSIENT` | New instance per consumer. | Loggers, stateful utilities |

### Scope Hierarchy

- **REQUEST bubbles up**: if a controller depends on a REQUEST-scoped service, the controller becomes REQUEST-scoped too.
- **TRANSIENT does NOT bubble up**: injecting a TRANSIENT provider into a singleton only gives that consumer a unique instance.

### Injecting REQUEST Object

```typescript
@Injectable({ scope: Scope.REQUEST })
export class MyService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

### Provider Registration

```typescript
{ provide: MyToken, useClass: MyClass }      // Instantiate class
{ provide: MyToken, useValue: myObject }     // Use existing value (mocks)
{ provide: MyToken, useFactory: (dep) => {}, inject: [Dep] }  // Factory with deps
```

## Circular Dependencies

Avoid where possible — they indicate tight coupling. When unavoidable:

### forwardRef for Providers
```typescript
constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
```
Both sides must use `forwardRef()`.

### forwardRef for Modules
```typescript
@Module({ imports: [forwardRef(() => OtherModule)] })
```

### ModuleRef Lazy Resolution (alternative)
Use `ModuleRef` to lazily retrieve a provider, breaking the circular reference entirely.

### Barrel File Warning
Do NOT use `index.ts` barrel files for imports within the same directory. This is a common cause of circular dependency issues.

## ModuleRef

Utility for dynamic DI container access:

| Method | Returns | Scope Support |
|---|---|---|
| `moduleRef.get(Token)` | Sync singleton instance | DEFAULT only |
| `moduleRef.resolve(Token)` | Async Promise | REQUEST, TRANSIENT |
| `moduleRef.create(Class)` | Async Promise | Unregistered classes |

For request-scoped resolution outside the request lifecycle:
```typescript
const contextId = ContextIdFactory.getByRequest(request);
const service = await this.moduleRef.resolve(MyService, contextId);
```

## Lazy Loading Modules

Use `LazyModuleLoader` for on-demand module loading (serverless cold starts, optional features):
```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);
const service = moduleRef.get(LazyService);
```
Modules are cached after first load.

## Testing

### Unit Test Pattern

```typescript
const mockRepository = {
  findOne: jest.fn().mockResolvedValue({ id: 1 }),
};

const module = await Test.createTestingModule({
  controllers: [MyController],
  providers: [
    MyService,
    { provide: getRepositoryToken(MyEntity), useValue: mockRepository },
  ],
}).compile();
```

### Override Methods (chain before `.compile()`)

| Method | Replaces |
|---|---|
| `.overrideProvider(Token).useValue/mock` | Any provider |
| `.overrideGuard(Token).useValue/mock` | Guards |
| `.overrideInterceptor(Token).useValue/mock` | Interceptors |
| `.overridePipe(Token).useValue/mock` | Pipes |
| `.overrideFilter(Token).useValue/mock` | Exception filters |

### E2E Test Pattern

```typescript
const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(MyService).useValue(mockService)
  .compile();

const app = moduleRef.createNestApplication();
await app.init();

request(app.getHttpServer()).get('/api/health').expect(200);

await app.close(); // Always clean up
```

### Test File Naming
- `*.spec.ts` — unit tests (root: `src/`)
- `*.e2e-spec.ts` — e2e tests (root: `test/`)

## Logger

- Custom `LoggerService` extends `ConsoleLogger` with **TRANSIENT scope** (prevents context leakage).
- Bootstrap uses `bufferLogs: true` to capture early logs before custom logger is attached.
- Usage: `this.logger.log('message')` — context is set automatically by class name.

## Compression

Response compression via `compression` middleware, registered in `main.ts`:
```typescript
app.use(compression());
```

## SWC Builder

- **SWC** (Rust-based) is ~20x faster than TypeScript compiler for transpilation.
- Configured in `nest-cli.json` with `builder: "swc"` and `typeCheck: true`.
- Type checking runs asynchronously via the TS compiler alongside SWC.
- Jest uses `@swc/jest` transformer for faster test transpilation.

## Database (MikroORM)

### Root Configuration

`DatabaseModule` uses `MikroOrmModule.forRootAsync()` with `ConfigService`:
```typescript
MikroOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    driver: PostgreSqlDriver,
    host: config.get('database.host'),
    port: config.get('database.port'),
    dbName: config.get('database.name'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    autoLoadEntities: true,
  }),
})
```

### Feature Module Registration

```typescript
@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UsersService],
})
export class UsersModule {}
```

### Repository Injection

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: EntityRepository<User>,
  ) {}
}
```

### Custom Repositories

```typescript
@Entity({ repository: () => UserRepository })
export class User {
  [EntityRepositoryType]?: UserRepository;
}

export class UserRepository extends EntityRepository<User> {
  // custom query methods
}
```

### Test Mocking

```typescript
{ provide: getRepositoryToken(User), useValue: mockRepository }
```

## Database Management

- **Local PostgreSQL**: `docker compose up -d` (PostgreSQL 18, port 5432).
- **Connection**: configured via env vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- **Entity auto-loading**: `autoLoadEntities: true` — entities registered via `forFeature()` are automatically discovered.
- **Debug mode**: enabled when `NODE_ENV=development`.
- **Never use `synchronize: true` in production** — use migrations.

## Swagger/OpenAPI

- Configured in `main.ts` with `DocumentBuilder`.
- Swagger UI at `/api/docs` (when `SWAGGER_ENABLED=true`).
- Use `@ApiTags('name')` to group controllers, `@ApiOperation` for endpoint descriptions.
- Add `"plugins": ["@nestjs/swagger"]` to `nest-cli.json` `compilerOptions` to auto-generate `@ApiProperty` metadata from TypeScript types.

## nest-commander

For building CLI tools using NestJS DI:
```typescript
@Command({ name: 'migrate', description: 'Run migrations' })
export class MigrateCommand extends CommandRunner {
  async run(): Promise<void> { /* ... */ }
}
```
Bootstrap with `CommandFactory.run(AppModule)` instead of `NestFactory.create()`.

## CRUD Generator

```bash
nest g resource <name>
```
Generates: module, controller, service, DTOs, entity, spec files. Automatically imports into `AppModule`.

## Code Style

- Prettier: single quotes, trailing commas (`all`).
- ESLint with `typescript-eslint` recommended type-checked config + Prettier integration.
- TypeScript: `ES2023` target, `commonjs` module resolution, decorators enabled.
- `noImplicitAny` is **off**; `strictNullChecks` is **on**.
