import { TContextOption } from './context-option';
import { TTransactionOption } from './transaction-option';
import { TDecorateOption } from './decorate-option';
import { TSkipHooksOption } from './skip-hooks-option';
import { TSelectOption } from './select-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';

export type TAllOptions<A> = Partial<
  TContextOption &
  TTransactionOption &
  TDecorateOption<A> &
  TSkipHooksOption &
  TSelectOption<A> &
  TSortOption<A> &
  TLimitOption &
  TOffsetOption
>;