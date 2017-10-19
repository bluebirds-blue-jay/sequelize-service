import { TSafeOptions } from '../../types/safe-options';
import { TAllOptions } from '../../types/all-options';
import { Collection } from '@bluejay/collection';
import { TOptionsMap } from '../../types/options-map';
import { TContext } from '../../types/context';
import { TFiltersMap } from '../../types/filters-map';
import { TFilters } from '../../types/filters';
import { TFindOptions } from '../../types/find-options';

export interface ISession<A, CP, O extends TSafeOptions = TAllOptions<A, CP>> extends Collection<A & Partial<CP>> {
  getOptions(): TOptionsMap<O>;
  getContext(): TContext;
  getOption<T extends O[keyof O]>(key: keyof O): T;
  setOption(key: keyof O, value: O[keyof O]): this;
  unsetOption(key: keyof O): this;
  getSafeOptions<TA = A, TCP = CP>(overrides?: Partial<TAllOptions<TA, TCP>>): TSafeOptions;
  getFilters(): TFiltersMap<A>;
  getRawFilters(): TFilters<A>
  hasFilters(): boolean;
  hasFilter(key: keyof A): boolean;
  ensureIdentified(options: TFindOptions<A, CP>): Promise<void>;
  ensureProperties(options: TFindOptions<A, CP>): Promise<void>;
  isIdentified(): boolean
  fetch(options: TFindOptions<A, CP>): Promise<void>
  hasOption(key: keyof O): boolean;
}