import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TParanoidOption } from './paranoid-option';
import { TSequelizeOrderOption } from './sequelize-order-option';
import { TSequelizeWhereOption } from './sequelize-where-option';
import { TTransactionOptions } from './transaction-options';
import { TUseMasterOption } from './use-master-option';

export type TAllSequelizeOptions<R> = Partial<TTransactionOptions &
  TSequelizeWhereOption<R> &
  TLimitOption &
  TOffsetOption &
  TSequelizeOrderOption<R> &
  TParanoidOption &
  TUseMasterOption>;
