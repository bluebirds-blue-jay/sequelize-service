import { ISession } from './session';
import { TUpdateOptions } from '../types/update-options';
import { TValuesMap } from '../types/values-map';

export interface IUpdateSession<W, R extends W, C> extends ISession<W, R, C, TUpdateOptions<R>> {
  getValues(): TValuesMap<W>;
  hasValue(key: keyof W): boolean;
  getValue<T extends Partial<W>[keyof W]>(key: keyof W): T;
  setValue(key: keyof W, value: Partial<W>[keyof W]): this;
}