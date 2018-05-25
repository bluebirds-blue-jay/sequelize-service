import { Collection } from '@bluejay/collection';
import { TAllOptions } from '../types/all-options';
import { TContext } from '../types/context';
import { TFilters } from '../types/filters';
import { TFiltersMap } from '../types/filters-map';
import { TFindOptions } from '../types/find-options';
import { TOptionsMap } from '../types/options-map';
import { TSafeOptions } from '../types/safe-options';

export interface ISession<W, R extends W, C, O extends TSafeOptions = TAllOptions<R, C, keyof R, keyof C>> extends Collection<Partial<R> & Partial<C>> {
  getOptions(): TOptionsMap<O>;

  getContext<T extends {} = any>(): TContext<T>;

  getOption<K extends keyof O>(key: K): O[K];

  setOption<K extends keyof O>(key: K, value: O[K]): this;

  unsetOption(key: keyof O): this;

  getSafeOptions<TR extends {} = R, TC extends {} = C>(overrides?: Partial<TAllOptions<TR, TC, keyof TR, keyof TC>>): TSafeOptions

  getFilters(): TFiltersMap<R>;

  getRawFilters(): TFilters<R>

  hasFilters(): boolean;

  hasFilter(key: keyof R): boolean;

  ensureIdentified<KR extends keyof R, KC extends keyof C>(options: TFindOptions<R, C, KR, KC>): Promise<void>;

  ensureProperties<KR extends keyof R, KC extends keyof C>(options: TFindOptions<R, C, KR, KC>): Promise<void>;

  isIdentified(): boolean

  fetch<KR extends keyof R, KC extends keyof C>(options: TFindOptions<R, C, KR, KC>): Promise<void>

  hasOption(key: keyof O): boolean;
}