import { TSimpleOperator } from './simple-operator';

export type TSimpleOperatorFilter<T, K extends keyof T = keyof T> = { [operator in Partial<TSimpleOperator>]: T[K] };
