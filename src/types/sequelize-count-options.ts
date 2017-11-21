import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOption } from './transaction-option';

export type TSequelizeCountOptions<T> = TSequelizeWhereOption<T> & Partial<TTransactionOption>;