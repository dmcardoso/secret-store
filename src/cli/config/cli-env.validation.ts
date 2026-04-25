import * as Joi from 'joi';

export const cliValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().default('secret_store'),
  DB_USER: Joi.string().default('secret_store_user'),
  DB_PASSWORD: Joi.string().default('secret_store_password'),
  SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('false'),
  ENCRYPTION_KEY: Joi.string().optional().allow(''),
});
