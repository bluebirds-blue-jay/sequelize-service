import { TSequelizeOperatorFilter } from './sequelize-operator-filter';

export type TSequelizeWhere<A> = { [key in keyof A]: A[key] | TSequelizeOperatorFilter<A, key> };