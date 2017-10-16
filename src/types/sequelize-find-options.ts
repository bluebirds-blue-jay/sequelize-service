import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOption } from './transaction-option';
import { TSequelizeOrderOption } from './sequelize-order-option';

export type TSequelizeFindOptions<A> = TSequelizeWhereOption<A> & Partial<TTransactionOption & TSequelizeOrderOption<A>>;