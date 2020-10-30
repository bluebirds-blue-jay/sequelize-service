import { TLimitOption } from './limit-option';
import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOption } from './transaction-option';

export type TSequelizeDestroyOptions<T> = TSequelizeWhereOption<T> & Partial<TTransactionOption & TLimitOption>;
