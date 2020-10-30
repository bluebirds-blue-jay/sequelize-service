import { TFilter } from './filter';

export type TFiltersMap<T, K extends keyof T = keyof T> = Map<K, TFilter<T, K>>;
