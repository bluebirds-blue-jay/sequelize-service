import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOption } from './transaction-option';
import { TSequelizeOrderOption } from './sequelize-order-option';

export type TSequelizeFindOptions<T> = TSequelizeWhereOption<T> & Partial<TTransactionOption & TSequelizeOrderOption<T>>;