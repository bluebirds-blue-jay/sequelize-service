import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';

export type TFindOptions<R, C, S> = TSafeOptions & Partial<TComputeOption<C> & TSelectOption<S> & TSortOption<R> & TLimitOption & TOffsetOption & TTransactionOptions>;