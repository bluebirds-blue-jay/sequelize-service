import { TSequelizeArrayOperatorFilter } from './sequelize-array-operator-filter';
import { TSequelizeSimpleOperatorFilter } from './sequelize-simple-operator-filter';

export type TSequelizeOperatorFilter<T, K extends keyof T = keyof T> = Partial<TSequelizeSimpleOperatorFilter<T, K> & TSequelizeArrayOperatorFilter<T, K>>;
