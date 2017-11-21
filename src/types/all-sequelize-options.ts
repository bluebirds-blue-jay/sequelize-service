import { TSequelizeOrderOption } from './sequelize-order-option';
import { TSequelizeWhereOption } from './sequelize-where-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';

export type TAllSequelizeOptions<R> = Partial<
  TTransactionOptions &
  TSequelizeOrderOption<R> &
  TSequelizeWhereOption<R> &
  TLimitOption &
  TOffsetOption &
  TSequelizeOrderOption<R>
>;