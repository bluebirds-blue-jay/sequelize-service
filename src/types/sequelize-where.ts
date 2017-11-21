import { TSequelizeOperatorFilter } from './sequelize-operator-filter';

export type TSequelizeWhere<R> = { [key in keyof R]: R[key] | TSequelizeOperatorFilter<R, key> };