import { TSequelizeOperatorFilter } from './sequelize-operator-filter';

export type TSequelizeWhere<T> = { [key in keyof T]: T[key] | TSequelizeOperatorFilter<T, key> };