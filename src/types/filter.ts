import { TOperatorFilter } from './operator-filter';
import { TSimpleFilter } from './simple-filter';

export type TFilter<T, K extends keyof T = keyof T> = TSimpleFilter<T, K> | TOperatorFilter<T, K>;
