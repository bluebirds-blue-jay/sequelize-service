import { TSafeOptions } from '../../types/safe-options';
import { TAllOptions } from '../../types/all-options';
import { Collection } from '@bluejay/collection';
import { TOptionsMap } from '../../types/options-map';
import { TContext } from '../../types/context';
import { TFiltersMap } from '../../types/filters-map';
import { TFilters } from '../../types/filters';
import { TFindOptions } from '../../types/find-options';

export interface ISession<A, O extends TSafeOptions = TAllOptions<A>> extends Collection<A> {
  getOptions(): TOptionsMap<O>;
  getContext(): TContext;
  getDecorations(): Set<keyof A>;
  hasDecoration(decoration: keyof A): boolean
  getOption<T extends O[keyof O]>(key: keyof O): T;
  setOption(key: keyof O, value: O[keyof O]): this;
  unsetOption(key: keyof O): this;
  getSafeOptions<T = A>(overrides?: Partial<TAllOptions<T>>): TSafeOptions;
  getFilters(): TFiltersMap<A>;
  getRawFilters(): TFilters<A>
  hasFilters(): boolean;
  hasFilter(key: keyof A): boolean;
  ensureIdentified(options: TFindOptions<A>): Promise<void>;
  ensureProperties(options: TFindOptions<A>): Promise<void>;
  isIdentified(): boolean
  fetch(options: TFindOptions<A>): Promise<void>
  hasOption(key: keyof O): boolean;
}