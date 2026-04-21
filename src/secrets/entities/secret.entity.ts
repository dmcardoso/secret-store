import { defineEntity, p, type InferEntity } from '@mikro-orm/core';
import { SecretRepository } from '../repositories/secret.repository';

const SecretSchema = defineEntity({
  name: 'Secret',
  repository: () => SecretRepository,
  properties: {
    id: p.uuid().primary().defaultRaw('uuidv7()'),
    username: p.string(),
    website: p.string(),
    secretName: p.string(),
    encryptedPassword: p.text(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export { SecretSchema };
export type Secret = InferEntity<typeof SecretSchema>;
