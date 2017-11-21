import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOption } from './transaction-option';

export type TSequelizeCountOptions<R> = TSequelizeWhereOption<R> & Partial<TTransactionOption>;