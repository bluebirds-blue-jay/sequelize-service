import { TSimpleFilter } from './simple-filter';
import { TOperatorFilter } from './operator-filter';

export type TFilter<T, K extends keyof T = keyof T> = TSimpleFilter<T, K> | TOperatorFilter<T, K>;