import { TContextOption } from './context-option';
import { TComputeOption } from './compute-option';
import { TSkipHooksOption } from './skip-hooks-option';
import { TSelectOption } from './select-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';

export type TAllOptions<R, C> = Partial<
  TContextOption &
  TTransactionOptions &
  TComputeOption<C> &
  TSkipHooksOption &
  TSelectOption<R> &
  TSortOption<R> &
  TLimitOption &
  TOffsetOption
>;