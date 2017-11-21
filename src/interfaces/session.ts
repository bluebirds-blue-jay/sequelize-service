import { TSafeOptions } from '../types/safe-options';
import { TAllOptions } from '../types/all-options';
import { Collection } from '@bluejay/collection';
import { TOptionsMap } from '../types/options-map';
import { TContext } from '../types/context';
import { TFiltersMap } from '../types/filters-map';
import { TFilters } from '../types/filters';
import { TFindOptions } from '../types/find-options';

export interface ISession<W, R extends W, C, O extends TSafeOptions = TAllOptions<R, C>> extends Collection<Partial<R> & Partial<C>> {
  getOptions(): TOptionsMap<O>;
  getContext(): TContext;
  getOption<K extends keyof O>(key: K): O[K];
  setOption<K extends keyof O>(key: K, value: O[K]): this;
  unsetOption(key: keyof O): this;
  getSafeOptions<TR extends {} = R, TC extends {} = C>(overrides?: Partial<TAllOptions<TR, TC>>): TSafeOptions;
  getFilters(): TFiltersMap<R>;
  getRawFilters(): TFilters<R>
  hasFilters(): boolean;
  hasFilter(key: keyof R): boolean;
  ensureIdentified(options: TFindOptions<R, C>): Promise<void>;
  ensureProperties(options: TFindOptions<R, C>): Promise<void>;
  isIdentified(): boolean
  fetch(options: TFindOptions<R, C>): Promise<void>
  hasOption(key: keyof O): boolean;
}