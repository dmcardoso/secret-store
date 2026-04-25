export const DELETE_SECRET_SERVICE = Symbol('DELETE_SECRET_SERVICE');

export interface IDeleteSecretService {
  execute(id: string): Promise<void>;
}
