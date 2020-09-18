import { TOperatorFilter } from './operator-filter';

export type TFilters<T> = { [key in keyof Partial<T>]: T[key] | TOperatorFilter<T, key> };
