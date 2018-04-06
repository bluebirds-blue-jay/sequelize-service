import { ISession } from './session';
import { TUpdateOptions } from '../types/update-options';
import { TValuesMap } from '../types/values-map';
import { TValues } from '../types/values';

export interface IUpdateSession<W extends {}, R extends W, C extends {}, O extends {} = {}> extends ISession<W, R, C, TUpdateOptions<R> & O> {
  getValues(): TValuesMap<W>;
  getRawValues(): TValues<W>;
  hasValue(key: keyof W): boolean;
  getValue<T extends Partial<W>[keyof W]>(key: keyof W): T;
  setValue(key: keyof W, value: Partial<W>[keyof W]): this;
}