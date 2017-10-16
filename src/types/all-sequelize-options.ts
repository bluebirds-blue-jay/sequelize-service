import { TSequelizeOrderOption } from './sequelize-order-option';
import { TSequelizeWhereOption } from './sequelize-where-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';

export type TAllSequelizeOptions<A> = Partial<
  TTransactionOptions &
  TSequelizeOrderOption<A> &
  TSequelizeWhereOption<A> &
  TLimitOption &
  TOffsetOption &
  TSequelizeOrderOption<A>
>;