import { TSequelizeWhereOption } from './sequelize-where-option';
import { TLimitOption } from './limit-option';
import { TTransactionOptions } from './transaction-options';

export type TSequelizeUpdateOptions<T> = Partial<TTransactionOptions & TLimitOption & TSequelizeWhereOption<T>>;