import { TSimpleOperatorFilter } from './simple-operator-filter';
import { TArrayOperatorFilter } from './array-operator-filter';

export type TOperatorFilter<T, K extends keyof T = keyof T> = Partial<TSimpleOperatorFilter<T, K> & TArrayOperatorFilter<T, K>>;