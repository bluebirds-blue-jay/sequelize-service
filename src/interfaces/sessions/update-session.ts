import { ISession } from './session';
import { TUpdateOptions } from '../../types/update-options';
import { TValuesMap } from '../../types/values-map';

export interface IUpdateSession<A, CP> extends ISession<A, CP, TUpdateOptions<A>> {
  getValues(): TValuesMap<A>;
  hasValue(key: keyof A): boolean;
  getValue<T extends Partial<A>[keyof A]>(key: keyof A): T;
  setValue(key: keyof A, value: Partial<A>[keyof A]): this;
}