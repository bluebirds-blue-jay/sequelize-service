import { TUpsertOptions } from '../types/upsert-options';
import { ISession } from './session';

export interface IUpsertSession<W extends {}, R extends W, C extends {}, KC extends keyof C = keyof C, O extends {} = {}> extends ISession<W, R, C, TUpsertOptions<R, C, KC> & O> {
  setCreated(created: boolean): void;
  isCreated(): boolean | undefined;
  isUpdated(): boolean | undefined;
}
