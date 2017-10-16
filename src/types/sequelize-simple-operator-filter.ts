import { TSequelizeSimpleOperator } from './sequelize-simple-operator';

export type TSequelizeSimpleOperatorFilter<T, K extends keyof T = keyof T> = { [operator in Partial<TSequelizeSimpleOperator>]: T[K] };