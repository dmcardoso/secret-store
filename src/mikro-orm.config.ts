import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  dbName: process.env.DB_NAME ?? 'secret_store',
  user: process.env.DB_USER ?? 'secret_store_user',
  password: process.env.DB_PASSWORD ?? 'secret_store_password',
  entities: ['**/*.entity.js'],
  entitiesTs: ['**/*.entity.ts'],
  extensions: [Migrator],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
    transactional: true,
    allOrNothing: true,
    snapshot: true,
    emit: 'ts',
  },
});
