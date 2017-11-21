import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOption } from './transaction-option';
import { TLimitOption } from './limit-option';

export type TSequelizeDestroyOptions<R> = TSequelizeWhereOption<R> & Partial<TTransactionOption & TLimitOption>;