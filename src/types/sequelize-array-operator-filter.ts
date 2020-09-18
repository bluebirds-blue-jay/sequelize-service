import { TSequelizeArrayOperator } from './sequelize-array-operator';

export type TSequelizeArrayOperatorFilter<T, K extends keyof T = keyof T> = { [operator in Partial<TSequelizeArrayOperator>]: (T[K])[] };
