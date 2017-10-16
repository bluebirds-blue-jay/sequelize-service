import { TArrayOperator } from './array-operator';

export type TArrayOperatorFilter<T, K extends keyof T = keyof T> = { [operator in Partial<TArrayOperator>]: (T[K])[] };