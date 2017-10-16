import { TTransactionOption } from './transaction-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';
import { TSequelizeOrderOption } from './sequelize-order-option';
import { TSequelizeWhereOption } from './sequelize-where-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';

export type TAllSequelizeOptions<A> = Partial<
  TTransactionOption &
  TTransactionIsolationLevelOption &
  TSequelizeOrderOption<A> &
  TSequelizeWhereOption<A> &
  TLimitOption &
  TOffsetOption &
  TSequelizeOrderOption<A>
>;