import { TLimitOption } from './limit-option';
import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOptions } from './transaction-options';

export type TSequelizeUpdateOptions<T> = Partial<TTransactionOptions & TLimitOption & TSequelizeWhereOption<T>>;
