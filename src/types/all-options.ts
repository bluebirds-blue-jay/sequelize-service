import { TContextOption } from './context-option';
import { TDecorateOption } from './decorate-option';
import { TSkipHooksOption } from './skip-hooks-option';
import { TSelectOption } from './select-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';

export type TAllOptions<A> = Partial<
  TContextOption &
  TTransactionOptions &
  TDecorateOption<A> &
  TSkipHooksOption &
  TSelectOption<A> &
  TSortOption<A> &
  TLimitOption &
  TOffsetOption
>;