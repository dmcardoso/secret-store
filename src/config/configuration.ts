export default () => ({
  node: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'secret_store',
    user: process.env.DB_USER ?? 'secret_store_user',
    password: process.env.DB_PASSWORD ?? 'secret_store_password',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY ?? '',
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
  },
});
