import { TUpdateOptions } from '../types/update-options';
import { TValues } from '../types/values';
import { TValuesMap } from '../types/values-map';
import { ISession } from './session';

export interface IUpdateSession<W extends {}, R extends W, C extends {}, O extends {} = {}> extends ISession<W, R, C, TUpdateOptions<R> & O> {
  getValues(): TValuesMap<W>;
  getRawValues(): TValues<W>;
  hasValue(key: keyof W): boolean;
  getValue<K extends keyof W>(key: K): W[K];
  setValue<K extends keyof W>(key: K, value: W[K]): this;
}
