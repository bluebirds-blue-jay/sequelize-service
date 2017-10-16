import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOption } from './transaction-option';

export type TSequelizeCountOptions<A> = TSequelizeWhereOption<A> & Partial<TTransactionOption>;